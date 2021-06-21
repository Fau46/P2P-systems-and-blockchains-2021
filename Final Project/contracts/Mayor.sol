pragma solidity 0.8.1;

contract Mayor {
    
    // Structs, events, and modifiers
    
    struct Register_candidate{
        address candidate_address;
        address coalition_address;
    }

    struct Voter {
        uint soul;
        address candidate;
        bool opened;
    }

    struct Candidate{
        uint soul;
        uint voters_num;
        bool init;
    }

    struct Coalition{
        address[] members;
        uint soul;
        bool init;
    }

    struct Return_coalition{
        address[] members;
        address addr;
    }

    struct Coalition_winner{
        address addr;
        uint soul;
    }

    struct Candidate_winner{
        address addr;
        uint soul;
        uint voters_num;
    }

    // Data to manage the confirmation
    struct Conditions {
        uint32 quorum;
        uint32 envelopes_casted;
        uint32 envelopes_opened;
    }
    
    event NewMayor(address _candidate);
    event Sayonara(address _escrow);
    event EnvelopeCast(address _voter);
    event EnvelopeOpen(address _voter, uint _soul, address _candidate);
    
    // Someone can vote as long as the quorum is not reached
    modifier canVote() {
        require(voting_condition.envelopes_casted < voting_condition.quorum, "Cannot vote now, voting quorum has been reached");
        _;   
    }
    
    // Envelopes can be opened only after receiving the quorum
    modifier canOpen() {
        require(voting_condition.envelopes_casted == voting_condition.quorum, "Cannot open an envelope, voting quorum not reached yet");
        _;
    }
    
    // The outcome of the confirmation can be computed as soon as all the casted envelopes have been opened
    modifier canCheckOutcome() {
        require(voting_condition.envelopes_opened == voting_condition.quorum, "Cannot check the winner, need to open all the sent envelopes");
        _;
    }
    
    // State attributes
    
    // Initialization variables
    address payable escrow;
    address payable public winner;

    // Voting phase variables
    mapping(address => bytes32) envelopes;

    Conditions public voting_condition;
    Coalition_winner coalition_winner;
    Candidate_winner candidate_winner;

    uint totSouls;
    mapping (address => Candidate) candidates;
    mapping (address => Coalition) coalitions;
    mapping(address => Voter) voters;
    address[] candidates_addrs;
    address[] coalitions_addrs;
    address[] voters_addrs;
    bool public elections_over; //Flag for avoid reentrancy in mayor_or_sayonara

    /// @notice The constructor only initializes internal variables
    /// @param _candidates (array) The address of the mayor candidate and optionally also the coaliton's address
    /// @param _escrow (address) The address of the escrow account
    /// @param _quorum (address) The number of voters required to finalize the confirmation
    constructor(Register_candidate[] memory _candidates, address payable _escrow, uint32 _quorum) public {
        for(uint i = 0; i < _candidates.length; i++){
            address candidate_addr = _candidates[i].candidate_address;
            address coalition_addr = _candidates[i].coalition_address;

            require(coalitions[candidate_addr].init == false, "The candidate cannot be a coalition");
            require(candidates[candidate_addr].init == false, "The candidate is already registered");

            candidates[candidate_addr] = Candidate({soul: 0, voters_num:0, init: true});
            candidates_addrs.push(candidate_addr);
            
            if(coalition_addr != address(0x0)){
                require(candidates[coalition_addr].init == false, "The coalition cannot be a candidate");
                coalitions[coalition_addr].members.push(candidate_addr);
                
                if(coalitions[coalition_addr].init == false){
                    coalitions[coalition_addr].init = true;
                    coalitions_addrs.push(coalition_addr);
                }
            }
        }

        escrow = _escrow;
        voting_condition = Conditions({quorum: _quorum, envelopes_casted: 0, envelopes_opened: 0});
    }


    /// @notice Store a received voting envelope
    /// @param _envelope The envelope represented as the keccak256 hash of (sigil, doblon, soul) 
    function cast_envelope(bytes32 _envelope) canVote public {
        
        if(envelopes[msg.sender] == 0x0) // => NEW, update on 17/05/2021
            voting_condition.envelopes_casted++;

        envelopes[msg.sender] = _envelope;
        emit EnvelopeCast(msg.sender);
    }
    
    
    /// @notice Open an envelope and store the vote information
    /// @param _sigil (uint) The secret sigil of a voter
    /// @param _candidate (address) The voting preference
    /// @dev The soul is sent as crypto
    /// @dev Need to recompute the hash to validate the envelope previously casted
    function open_envelope(uint _sigil, address _candidate) canOpen public payable {       
        require(envelopes[msg.sender] != 0x0, "The sender has not casted any vote");
        require(voters[msg.sender].opened == false, "Envelope already opened");
        
        bytes32 _casted_envelope = envelopes[msg.sender];
        bytes32 _sent_envelope = compute_envelope(_sigil, _candidate, msg.value);

        require(_casted_envelope == _sent_envelope, "Sent envelope does not correspond to the one casted");
        
        voting_condition.envelopes_opened++;

        if(coalitions[_candidate].init == true){ //if the voter has voted for a coalition
            voters_addrs.push(msg.sender);
            voters[msg.sender] = Voter({soul: msg.value, candidate: _candidate, opened: true});
            coalitions[_candidate].soul += msg.value;
            totSouls+=msg.value;
            
            if(coalitions[_candidate].soul > coalition_winner.soul){
                coalition_winner.addr = _candidate;
                coalition_winner.soul = coalitions[_candidate].soul;
            }
            else if(coalitions[_candidate].soul == coalition_winner.soul){
                coalition_winner.addr = address(0x0); //Reset the winner due to tie
            }
        }
        else if(candidates[_candidate].init == true){
            voters_addrs.push(msg.sender);
            voters[msg.sender] = Voter({soul: msg.value, candidate: _candidate, opened: true});
            candidates[_candidate].soul += msg.value;
            candidates[_candidate].voters_num++;
            totSouls+=msg.value;

            if((candidates[_candidate].soul > candidate_winner.soul) || (candidates[_candidate].soul == candidate_winner.soul && candidates[_candidate].voters_num > candidate_winner.voters_num)){ //if _candiate has more soul or equal soul and more voters than the actual winner
                candidate_winner.addr = _candidate;
                candidate_winner.soul = candidates[_candidate].soul;
                candidate_winner.voters_num = candidates[_candidate].voters_num;
            }
            else if(candidates[_candidate].soul == candidate_winner.soul && candidates[_candidate].voters_num == candidate_winner.voters_num){ //case of tie
                candidate_winner.addr = address(0x0); //reset the winner
            }
           
        }
        else{
            address payable voter = payable(msg.sender);
            voter.transfer(msg.value); //the voter has voted for someone that is not a candidate or a coalition
        }

        emit EnvelopeOpen(msg.sender, msg.value, _candidate);
    }
    
    
    /// @notice Either confirm or kick out the candidate. Refund the electors who voted for the losing outcome
    function mayor_or_sayonara() canCheckOutcome public {
        require(elections_over == false, "The elections are over");
        elections_over = true;
        uint winner_soul;

        if(coalition_winner.addr != address(0x0) && coalition_winner.soul > totSouls/3){
            winner = payable(coalition_winner.addr);
            winner_soul = coalition_winner.soul;
        }
        else if(candidate_winner.addr != address(0x0)){
            winner = payable(candidate_winner.addr);
            winner_soul = candidate_winner.soul;
        }
        

        if(winner != address(0x0)){
            winner.transfer(winner_soul);

            for(uint i = 0; i < voters_addrs.length; i++){
                address payable voter = payable(voters_addrs[i]);
                if(winner != voters[voter].candidate){
                    voter.transfer(voters[voter].soul);
                }
            }

            emit NewMayor(winner);
        }
        else{
            escrow.transfer(totSouls);
            emit Sayonara(escrow);
        }
    }
 
 
    /// @notice Compute a voting envelope
    /// @param _sigil (uint) The secret sigil of a voter
    /// @param _candidate (address) The voting preference
    /// @param _soul (uint) The soul associated to the vote
    function compute_envelope(uint _sigil, address _candidate, uint _soul) public pure returns(bytes32) {
        return keccak256(abi.encode(_sigil, _candidate, _soul));
    }


    function get_candidate_addrs() external view returns (address[] memory){
        return candidates_addrs;
    }

    function get_coalitions() external view returns (Return_coalition[] memory){
        Return_coalition[] memory coalitions_array = new Return_coalition[](coalitions_addrs.length);

        for(uint i = 0; i < coalitions_addrs.length; i++){
            address coalition = coalitions_addrs[i];
            coalitions_array[i] = Return_coalition({members: coalitions[coalition].members, addr: coalition});
        }

        return coalitions_array;
    }

    function get_voting_condition() external view returns(uint32,uint32,uint32){
        return (voting_condition.quorum,voting_condition.envelopes_casted,voting_condition.envelopes_opened);
    }
}