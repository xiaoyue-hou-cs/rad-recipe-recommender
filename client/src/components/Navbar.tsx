import "../styles/Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <ul>
      <li>
        <Link to={`/`}>HOME</Link>
      </li>
      <li>
        <Link to={"/search"}>SEARCH</Link>
      </li>
      <li>
        <Link to={"/gallery"}> USERS </Link>
      </li>
      <li>
        <Link to={"/friends"}> FRIENDS </Link>
      </li>
    </ul>
  );
}

export default Navbar;
