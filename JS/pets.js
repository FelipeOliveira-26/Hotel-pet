const CHAVE_PETS = "hotelPetPets";

function obterPets() {
    return JSON.parse(localStorage.getItem(CHAVE_PETS)) || [];
}

function guardarPets(pets) {
    localStorage.setItem(CHAVE_PETS, JSON.stringify(pets));
}

function obterIdPet() {
    return new URLSearchParams(window.location.search).get("id");
}

// CADASTRAR PET
function configurarCadastroPet() {
    const formulario = document.querySelector("#formNovoPet");
    if (!formulario) return;

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const proprietario = document.querySelector("#proprietario").value.trim();
        const nome = document.querySelector("#nome").value.trim();
        const tipo = document.querySelector("#tipo").value;
        const raca = document.querySelector("#raca").value.trim();
        const tamanho = document.querySelector("#tamanho").value;

        if (!proprietario || !nome || !tipo || !raca || !tamanho) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const pets = obterPets();

        pets.push({
            id: Date.now().toString(),
            proprietario,
            nome,
            tipo,
            raca,
            tamanho,
            criadoEm: new Date().toISOString()
        });

        guardarPets(pets);
        alert("Pet salvo com sucesso!");

        window.location.href = "tela_pet.html";
    });
}

// EXIBIR PETS NA TABELA
function exibirPets() {
    const tabela = document.querySelector("#listaPets");
    if (!tabela) return;

    obterPets().forEach(pet => {
        const linha = document.createElement("tr");

        const dados = [
            pet.id,
            pet.nome,
            pet.proprietario,
            pet.tipo,
            pet.raca,
            pet.tamanho
        ];

        dados.forEach(texto => {
            const celula = document.createElement("td");
            celula.textContent = texto;
            linha.appendChild(celula);
        });

        const acoes = document.createElement("td");

        const linkEditar = document.createElement("a");
        linkEditar.href = `editar_pet.html?id=${encodeURIComponent(pet.id)}`;
        linkEditar.textContent = "Editar";

        const linkVer = document.createElement("a");
        linkVer.href = `visualizar_pet.html?id=${encodeURIComponent(pet.id)}`;
        linkVer.textContent = "Visualizar";

        const botaoExcluir = document.createElement("button");
        botaoExcluir.type = "button";
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.addEventListener("click", () => {
            excluirPet(pet.id);
        });

        acoes.append(
            linkEditar,
            document.createTextNode(" | "),
            linkVer,
            document.createTextNode(" | "),
            botaoExcluir
        );

        linha.appendChild(acoes);
        tabela.appendChild(linha);
    });
}

// EXCLUIR PET
function excluirPet(id) {
    if (!confirm("Deseja realmente excluir este pet?")) return;

    const pets = obterPets().filter(pet => pet.id !== id);

    guardarPets(pets);
    alert("Pet excluído com sucesso!");
    window.location.href = "tela_pet.html";
}

// EDITAR PET
function configurarEdicaoPet() {
    const formulario = document.querySelector("#formEditarPet");
    if (!formulario) return;

    const id = obterIdPet();
    const pets = obterPets();
    const pet = pets.find(item => item.id === id);

    if (!pet) {
        alert("Pet não encontrado.");
        window.location.href = "tela_pet.html";
        return;
    }

    // preenche o formulário com os dados do pet
    document.querySelector("#proprietario").value = pet.proprietario;
    document.querySelector("#nome").value = pet.nome;
    document.querySelector("#tipo").value = pet.tipo;
    document.querySelector("#raca").value = pet.raca;
    document.querySelector("#tamanho").value = pet.tamanho;

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const proprietario = document.querySelector("#proprietario").value.trim();
        const nome = document.querySelector("#nome").value.trim();
        const tipo = document.querySelector("#tipo").value;
        const raca = document.querySelector("#raca").value.trim();
        const tamanho = document.querySelector("#tamanho").value;

        if (!proprietario || !nome || !tipo || !raca || !tamanho) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        const indice = pets.findIndex(item => item.id === id);

        pets[indice] = {
            ...pets[indice],
            proprietario,
            nome,
            tipo,
            raca,
            tamanho
        };

        guardarPets(pets);
        alert("Pet atualizado com sucesso!");
        window.location.href = "tela_pet.html";
    });
}

// VISUALIZAR PET
function configurarConsultaPet() {
    const area = document.querySelector("#detalhesPet");
    if (!area) return;

    const id = obterIdPet();
    const pet = obterPets().find(item => item.id === id);

    if (!pet) {
        area.textContent = "Pet não encontrado.";
        return;
    }

    const tipos = { cachorro: "Cachorro", gato: "Gato" };
    const tamanhos = { pequeno: "Pequeno", medio: "Médio", grande: "Grande" };

    document.querySelector("#visualProprietario").textContent = pet.proprietario;
    document.querySelector("#visualId").textContent = pet.id;
    document.querySelector("#visualNome").textContent = pet.nome;
    document.querySelector("#visualTipo").textContent = tipos[pet.tipo] || pet.tipo;
    document.querySelector("#visualRaca").textContent = pet.raca;
    document.querySelector("#visualTamanho").textContent = tamanhos[pet.tamanho] || pet.tamanho;

    // botões Editar e Deletar
    document.querySelector("#linkEditar").href = `editar_pet.html?id=${encodeURIComponent(pet.id)}`;
    document.querySelector("#linkDeletar").addEventListener("click", (event) => {
        event.preventDefault();
        excluirPet(pet.id);
    });

    // reservas do pet (procura pelo nome)
    const reservas = JSON.parse(localStorage.getItem("hotelPetReservas")) || [];
    const doPet = reservas.filter(reserva =>
        reserva.pet.toLowerCase() === pet.nome.toLowerCase()
    );

    const lista = document.querySelector("#listaReservasPet");
    const formatar = data => data.split("-").reverse().join("/");

    if (doPet.length === 0) {
        lista.append(document.createTextNode("Nenhuma reserva."));
    }

    doPet.forEach(reserva => {
        const link = document.createElement("a");
        link.href = `ver_reserva.html?id=${encodeURIComponent(reserva.id)}`;
        link.textContent = `${formatar(reserva.dataInicio)} - ${formatar(reserva.dataFim)} (${reserva.status})`;

        lista.append(link, document.createElement("br"));
    });
}

document.addEventListener("DOMContentLoaded", () => {
    configurarCadastroPet();
    exibirPets();
    configurarEdicaoPet();
    configurarConsultaPet();
});