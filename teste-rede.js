fetch("https://generativelanguage.googleapis.com")
  .then(r => console.log("SUCESSO:", r.status))
  .catch(e => {
    console.log("ERRO:", e.message);
    console.log("CAUSA:", e.cause);
  });	