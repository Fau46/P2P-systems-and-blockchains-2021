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
          <Header className="site-layout-background" style={{ padding: 0}} >
            <div className="voting-condition" style={{color: "white"}}>
            </div>
            <div className="account" style={{
              color: "white", marginRight: "30px", lineHeight: "normal", display: "inline-flex", position: "relative", float: "right", top: "20px"
            }}>
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
          </Header>
        
          <Content style={{ margin: '0 16px' }}>
            {this.props.children}
          </Content>
        
          <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default LayoutPage