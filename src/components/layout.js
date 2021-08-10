import * as React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header = (
    <h1 className="main-heading">
      <Link to="/">{title}</Link>
    </h1>
  )

  // if (isRootPath) {
  //   header = (
  //     <h1 className="main-heading">
  //       <Link to="/">{title}</Link>
  //     </h1>
  //   )
  // } else {
  //   header = (
  //     <Link className="header-link-home" to="/">
  //       {title}
  //     </Link>
  //   )
  // }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer>
        <a href="http://jurgo.me">About me</a>
        <span> | </span><a href="https://twitter.com/uselessclown?lang=en">Twitter</a> 
        <span> | </span><a href="https://github.com/jurgob">Github</a> 
        <span> | </span><a href="https://medium.com/@jurgo.boemo">Medium</a> 
      </footer>
    </div>
  )
}

export default Layout
