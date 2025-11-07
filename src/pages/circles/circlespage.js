
import React, { useState, useEffect } from "react";
import CirclesPage from "./circlespage";


const CirclesPage = () => {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch or set your circles here
    setCircles([{ id: 1, name: "Circle 1" }]);
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Circles</h2>
      <ul>
        {circles.map((circle) => (
          <li key={circle.id}>{circle.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default CirclesPage;
