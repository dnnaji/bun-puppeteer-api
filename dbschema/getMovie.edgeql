   select Movie {
      title,
      actors: {
        name,
      }
    } filter .title = "Iron Man 2"
