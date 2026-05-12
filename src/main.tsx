// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Provider} from 'react-redux'
import store from './store/index.ts'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

dayjs.locale('zh-cn')

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <Provider store={store} >
    <ConfigProvider locale={zhCN} >
      <App />
    </ConfigProvider>
  </Provider>
  // </StrictMode>,
)
