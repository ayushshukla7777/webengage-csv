const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/generate-csv", async (req, res) => {
  try {
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      axios.get("https://jsonplaceholder.typicode.com/users"),
      axios.get("https://jsonplaceholder.typicode.com/posts"),
      axios.get("https://jsonplaceholder.typicode.com/comments"),
    ]);

    const users = usersResponse.data;
    const posts = postsResponse.data;
    const comments = commentsResponse.data;

    const data = users.map((user) => {
      const post = posts.find((p) => p.id === user.id);
      const comment = comments.find((c) => c.id === user.id);

      return {
        name: user.name,
        title: post ? post.title : "",
        body: comment ? comment.body : "",
      };
    });

    const csvWriter = createCsvWriter({
      path: path.join(__dirname, "output.csv"),
      header: [
        { id: "name", title: "Name" },
        { id: "title", title: "Title" },
        { id: "body", title: "Body" },
      ],
    });

    await csvWriter.writeRecords(data);

    res.json({ filePath: path.join(__dirname, "output.csv") });
  } catch (error) {
    console.error("Error generating CSV:", error);
    res.status(500).json({ error: "Failed to generate CSV file" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
