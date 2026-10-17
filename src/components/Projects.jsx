import axios from "axios";
import { useEffect, useState } from "react";

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios
      .get("https://api.github.com/users/Tyke1117/repos")
      .then((response) => {
        setRepos(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        alert("Error fetching data: " + error);
      });
  }, []);

  // Filter repositories based on search
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <h1>My Projects</h1>

      {/* Search Box */}
      <input
        type="text"
        placeholder="Search Repository"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "5px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          marginTop: "24px",
        }}
      >
        {filteredRepos.map((repo) => (
  <div
    key={repo.id}
    style={{
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "24px",
      width: "100%",
      textAlign: "left",
      background: "var(--code-bg)",
    }}
  >
    <h3
      style={{
        margin: "0 0 10px",
        color: "var(--text-h)",
      }}
    >
      {repo.name}
    </h3>

    <p
      style={{
        margin: 0,
        color: "var(--text)",
        fontSize: "16px",
      }}
    >
      ⭐ Stars: {repo.stargazers_count}
    </p>
  </div>
))}
      </div>
    </div>
  );
}