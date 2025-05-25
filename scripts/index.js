document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const pasta = document.getElementById("pasta").value;
  const arquivos = document.getElementById("arquivos").files;
  const form = document.getElementById("uploadForm");
  const loading = document.getElementById("loading");
  const status = document.getElementById("status");

  if (!pasta || arquivos.length === 0) {
    alert("Preencha o chassi e selecione pelo menos uma imagem.");
    return;
  }

  form.style.display = "none";
  loading.style.display = "block";
  status.textContent = "";

  const formData = new FormData();
  formData.append("pasta", pasta);
  for (let i = 0; i < arquivos.length; i++) {
    formData.append("arquivos", arquivos[i]);
  }

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    // Delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    loading.style.display = "none";
    status.textContent = result.message || "Enviado com sucesso!";
    status.style.color = "green";

    // Delay
    await new Promise((resolve) => setTimeout(resolve, 3000));
    status.textContent = "";
    form.removeAttribute("style");
    document.getElementById("arquivos").value = "";
    document.getElementById("pasta").value = "";
  } catch (error) {
    loading.style.display = "none";
    status.textContent = "Erro ao enviar: " + error.message;
    status.style.color = "red";

    form.classList.add("hidden");
  }
});
