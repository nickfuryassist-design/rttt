import React from 'react'
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { HyperText } from "@/components/ui/hyper-text"
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {login, getUser,logout} from '../auth';
import { updateUser } from '@/redux/rtttSlice';



function Header() {
    const user = useSelector(state=>state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleClick = async () => {
        await logout()
        dispatch(updateUser(null))
        navigate('')

    }
  return (
<header className="pb-6 bg-white lg:pb-0">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        <nav className="flex items-center justify-between h-16 lg:h-20">
            
            <div className="flex-shrink-0">
                <a href="#" title="" className="flex">
                    <AnimatedGradientText><HyperText>RTTT</HyperText></AnimatedGradientText>
                </a>
            </div>

            { user ? <button onClick={handleClick} className="inline-flex items-center justify-center px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:bg-blue-700">Log out</button> :
            <Link to='login/' title="" className="inline-flex items-center justify-center px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:bg-blue-700" role="button">
                Login
            </Link>
            }
        </nav>
    </div>
</header>


  )
}

export default Header