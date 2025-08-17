import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { setBoards } from "../features/boardSlice";
import API from "../services/api";
import { Link } from "react-router-dom";

interface Board {
    _id: string;
    name: string;
}

function Dashboard() {
    const boards = useAppSelector((state) => state.board.boards as Board[]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const fetchBoards = async () => {
            try {
                const res = await API.get<Board[]>("/api/boards");
                dispatch(setBoards(res.data));
            } catch (err) {
                console.error(err);
            }
        };
        fetchBoards();
    }, [dispatch]);

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Boards</h2>
            <ul>
                {boards.map((b) => (
                    <li key={b._id}>
                        <Link to={`/board/${b._id}`}>{b.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Dashboard;
