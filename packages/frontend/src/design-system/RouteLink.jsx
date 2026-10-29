import { Link } from 'react-router-dom'

export function RouteLink({ to, className = '', children, ...props }) {
  return <Link to={to} className={className} {...props}>{children}</Link>
}
