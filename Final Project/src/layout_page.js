import React from 'react';
import { Layout, Menu, Divider } from 'antd';
import {
  DesktopOutlined,
  PieChartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

class LayoutPage extends React.Component {
    state = {
    collapsed: false,
  };

  

  onCollapse = collapsed => {
    console.log(collapsed);
    this.setState({ collapsed });
  };

  render() {
    const { collapsed } = this.state;
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={this.onCollapse}>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<UserOutlined />}>
              Candidates
            </Menu.Item>
            <Menu.Item key="2" icon={<TeamOutlined />}>
              Coalitions
            </Menu.Item>
            <Menu.Item key="9" icon={<FileOutlined />}>
              Files
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout className="site-layout">
          <Header className="site-layout-background" style={{ padding: 0}} >
            <div className="account" style={{
              color: "white", marginRight: "30px", lineHeight: "normal", display: "inline-flex", position: "relative", float: "right", top: "20px"
            }}>
              <UserOutlined />
              <Divider type="vertical" style={{backgroundColor:"white", top: 2}}/>
              {this.props.account}
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