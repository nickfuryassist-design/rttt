import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "leaflet/dist/leaflet.css"
import { store } from './redux/store'
import { Provider } from 'react-redux'
import Login from './pages/Login'
import Driver from './pages/Driver'
import Layout from './Layout'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path:'/',
    element: <Layout/>,
    children: [
      {
        path:"",
        element: <App/>
      },
      {
        path:"login",
        element: <Login/>
      },
      {
        path:'driver',
        element: <Driver/>
      }
    ]

  }

])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
