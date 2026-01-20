
import { Menu, type MenuProps } from 'antd';
import './index.less'
import { Link } from 'react-router-dom';

const NavigationMenu = () => {

  type MenuItem = Required<MenuProps>['items'][number];

  const items: MenuItem[] = [
    {
      key: 'TodoList',
      label: <Link to='/' >TodoList</Link>
    },
    {
      key: 'materialLibrary',
      label: <Link to='/material-library' >素材库</Link>
    },
    {
      key: 'weeklyReportTool',
      label: <Link to='/weekly-report-tool' >周报工具</Link>
    }
  ];
  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  return <div className="navigation-menu">
    <Menu
      onClick={onClick}
      style={{ width: 256 }}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      mode="inline"
      items={items}
    />
  </div>
}

export default NavigationMenu