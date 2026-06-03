import {useEffect} from 'react'

export useTimeout=(callback, timeout)=>useEffect({
  const timer = setTimeout(callback, timeout)
  return ()=>clearTimeout(timer)
},[])

export useInterval=(callback, interval)=>useEffect({
  const timer = setInterval(callback, interval)
  return ()=>clearInterval(timer)
},[])
