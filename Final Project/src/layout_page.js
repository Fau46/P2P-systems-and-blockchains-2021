import React from 'react';
import { Layout, Divider } from 'antd';
import {
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

class LayoutPage extends React.Component {
  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0, backgroundColor:'#204373'}} >
            <div className="voting-condition" style={{color: "white"}}>
            </div>
            <div className="account">
              Quorum: {this.props.quorum}
              <Divider type="vertical" style={{backgroundColor:"white", top: 2}}/>
              Env. Casted: {this.props.envelopes_casted}
              <Divider type="vertical" style={{backgroundColor:"white", top: 2}}/>
              Env. Openend: {this.props.envelopes_opened}
              <Divider type="vertical" style={{backgroundColor:"white", top: 2}}/>
              <UserOutlined />&nbsp;{this.props.account}
              <Divider type="vertical" style={{backgroundColor:"white", top: 2}}/>
              WEI {this.props.balance} 
            </div>
            <div className="title" style={{}}>VALADILÈNE ELECTIONS</div>
          </Header>
        
          <Content style={{ margin: '0 16px' }}>
            {this.props.children}
          </Content>
        
          <Footer style={{ textAlign: 'center' }}>Peer to Peer Systems and Blockchains 2020/21 <br/> Created by Fausto F. Frasca</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default LayoutPage