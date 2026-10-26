
const CHAVE_RESERVAS = "hotelPetReservas";
const CHAVE_DIARIA = "hotelPetValorDiaria";

function obterValorDiaria() {
    const valor = localStorage.getItem(CHAVE_DIARIA);
    return valor ? Number(valor) : 40;
}

function obterReservas() {
    return JSON.parse(localStorage.getItem(CHAVE_RESERVAS)) || [];
}

function guardarReservas(reservas) {
    localStorage.setItem(CHAVE_RESERVAS, JSON.stringify(reservas));
}

function obterIdUrl() {
    return new URLSearchParams(window.location.search).get("id");
}

function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

function calcularTotal(inicio, fim) {
    if (!inicio || !fim || fim <= inicio) return 0;

    const dataInicio = new Date(inicio + "T00:00:00");
    const dataFim = new Date(fim + "T00:00:00");
    const diarias = Math.round((dataFim - dataInicio) / 86400000);

    return diarias * obterValorDiaria();
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// CADASTRAR RESERVA
function configurarCadastro() {
    const formulario = document.querySelector("#formNovaReserva");
    if (!formulario) return;
    formulario.addEventListener("input", atualizarTotalEdicao);
    formulario.addEventListener("change", atualizarTotalEdicao);
    atualizarTotalEdicao();

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const pet = document.querySelector("#pet").value.trim();
        const dataInicio = document.querySelector("#data_inicio").value;
        const dataFim = document.querySelector("#data_fim").value;
        const notas = document.querySelector("#notas").value.trim();

        if (!pet || !dataInicio || !dataFim) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        if (dataFim <= dataInicio) {
            alert("A partida deve ser posterior à chegada.");
            return;
        }

        const reservas = obterReservas();

        reservas.push({
            id: Date.now().toString(),
            proprietario: "",
            pet,
            dataInicio,
            dataFim,
            notas,
            status: "reservado",
            total: calcularTotal(dataInicio, dataFim),
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        });

        guardarReservas(reservas);
        alert("Reserva salva com sucesso!");

        window.location.href = "tela_reserva.html";
    });
}

// EXIBIR RESERVAS NA TABELA
function exibirReservas(reservas = obterReservas()) {
    const tabela = document.querySelector("#listaReservas");
    if (!tabela) return;

    tabela.innerHTML = "";

    reservas.forEach(reserva => {
        const linha = document.createElement("tr");

        const celulaCheckbox = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        celulaCheckbox.appendChild(checkbox);
        linha.appendChild(celulaCheckbox);

        const dados = [
            reserva.id,
            reserva.pet,
            formatarData(reserva.dataInicio),
            formatarData(reserva.dataFim),
            nomeStatus(reserva.status),
            formatarMoeda(calcularTotal(reserva.dataInicio, reserva.dataFim))
        ];

        dados.forEach(texto => {
            const celula = document.createElement("td");
            celula.textContent = texto;
            linha.appendChild(celula);
        });

        const acoes = document.createElement("td");

        const linkEditar = document.createElement("a");
        linkEditar.href = `editar_reserva.html?id=${encodeURIComponent(reserva.id)}`;
        linkEditar.textContent = "Editar";

        const linkVer = document.createElement("a");
        linkVer.href = `ver_reserva.html?id=${encodeURIComponent(reserva.id)}`;
        linkVer.textContent = "Visualizar";

        
const botaoExcluir = document.createElement("button");

botaoExcluir.type = "button";
botaoExcluir.textContent = "Excluir";

botaoExcluir.addEventListener("click", () => {
    excluirReserva(reserva.id);
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

function nomeStatus(status) {
    const nomes = {
        reservado: "Reservado",
        andamento: "Em andamento",
        "em-progresso": "Em progresso",
        cancelado: "Cancelado",
        finalizado: "Finalizado",
        finalizada: "Finalizada"
    };

    return nomes[status] || status || "Reservado";
}

// EDITAR RESERVA
function configurarEdicao() {
    const formulario = document.querySelector("#formEditarReserva");
    if (!formulario) return;

    const id = obterIdUrl();
    const reservas = obterReservas();
    const reserva = reservas.find(item => item.id === id);

    if (!reserva) {
        alert("Reserva não encontrada. Volte à lista e selecione uma reserva cadastrada.");
        window.location.href = "tela_reserva.html";
        return;
    }

    document.querySelector("#proprietario").value = reserva.proprietario || "";
    document.querySelector("#pet").value = reserva.pet || "";
    document.querySelector("#data_inicio").value = reserva.dataInicio || "";
    document.querySelector("#data_fim").value = reserva.dataFim || "";
    document.querySelector("#notas").value = reserva.notas || "";
    document.querySelector("#status").value = reserva.status || "reservado";

    const total = document.querySelector("#totalDiarias");
    if (total) total.textContent = formatarMoeda(calcularTotal(reserva.dataInicio, reserva.dataFim));

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const proprietario = document.querySelector("#proprietario").value.trim();
        const pet = document.querySelector("#pet").value.trim();
        const dataInicio = document.querySelector("#data_inicio").value;
        const dataFim = document.querySelector("#data_fim").value;
        const notas = document.querySelector("#notas").value.trim();
        const status = document.querySelector("#status").value;

        if (!proprietario || !pet || !dataInicio || !dataFim || !status) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        if (dataFim <= dataInicio) {
            alert("A partida deve ser posterior à chegada.");
            return;
        }

        const indice = reservas.findIndex(item => item.id === id);
        if (indice === -1) {
            alert("Não foi possível localizar a reserva.");
            return;
        }

        reservas[indice] = {
            ...reservas[indice],
            proprietario,
            pet,
            dataInicio,
            dataFim,
            notas,
            status,
            total: calcularTotal(dataInicio, dataFim),
            atualizadoEm: new Date().toISOString()
        };

        guardarReservas(reservas);
        alert("Reserva atualizada com sucesso!");
        window.location.href = "tela_reserva.html";
    });

    formulario.addEventListener("input", atualizarTotalEdicao);
    formulario.addEventListener("change", atualizarTotalEdicao);
}

function atualizarTotalEdicao() {
    const inicio = document.querySelector("#data_inicio");
    const fim = document.querySelector("#data_fim");
    const total = document.querySelector("#totalDiarias");

    if (inicio && fim && total) {
        total.textContent = formatarMoeda(
            calcularTotal(inicio.value, fim.value)
        );
    }
}

// CONSULTAR RESERVA
function configurarConsulta() {
    const area = document.querySelector("#detalhesReserva");
    if (!area) return;

    const id = obterIdUrl();
    const reserva = obterReservas().find(item => item.id === id);

    if (!reserva) {
        area.textContent = "Reserva não encontrada.";
        return;
    }

    const preencher = (seletor, valor) => {
        const elemento = document.querySelector(seletor);
        if (elemento) elemento.textContent = valor || "-";
    };

    preencher("#visualId", reserva.id);
    preencher("#visualProprietario", reserva.proprietario);
    preencher("#visualPet", reserva.pet);
    preencher("#visualChegada", formatarData(reserva.dataInicio));
    preencher("#visualPartida", formatarData(reserva.dataFim));
    preencher("#visualNotas", reserva.notas);
    preencher("#visualStatus", nomeStatus(reserva.status));
    preencher("#visualTotal", formatarMoeda(calcularTotal(reserva.dataInicio, reserva.dataFim)));
    preencher("#visualCriado", reserva.criadoEm
        ? new Date(reserva.criadoEm).toLocaleDateString("pt-BR")
        : "-");
    preencher("#visualAtualizado", reserva.atualizadoEm
        ? new Date(reserva.atualizadoEm).toLocaleDateString("pt-BR")
        : "-");
}

document.addEventListener("DOMContentLoaded", () => {
    configurarCadastro();
    exibirReservas();
    configurarEdicao();
    configurarConsulta();
    configurarLimparFormulario();
    configurarConfiguracoes();
    configurarFiltroReservas();
    
    
});


function cancelarReserva(id) {
    const confirmar = confirm(
        "Tem certeza de que deseja cancelar e remover esta reserva?"
    );

    if (!confirmar) return;

    const reservas = obterReservas();

    const reservasAtualizadas = reservas.filter(
        reserva => reserva.id !== id
    );

    if (reservasAtualizadas.length === reservas.length) {
        alert("Reserva não encontrada.");
        return;
    }

    guardarReservas(reservasAtualizadas);

    alert("Reserva removida com sucesso!");

    window.location.reload();
}

function excluirReserva(id) {
    const confirmar = confirm(
        "Deseja realmente excluir esta reserva?"
    );

    if (!confirmar) {
        return;
    }

    const reservas = obterReservas();

    const reservasAtualizadas = reservas.filter(
        reserva => reserva.id !== id
    );

    if (reservasAtualizadas.length === reservas.length) {
        alert("Reserva não encontrada.");
        return;
    }

    guardarReservas(reservasAtualizadas);

    alert("Reserva excluída com sucesso!");

    window.location.reload();
}


function configurarLimparFormulario() {
    const botaoLimpar = document.querySelector("#limparFormulario");
    const formulario = document.querySelector("#formEditarReserva");

    if (!botaoLimpar || !formulario) return;

    botaoLimpar.addEventListener("click", () => {
        const confirmar = confirm(
            "Deseja limpar todos os campos do formulário?"
        );

        if (!confirmar) return;

        formulario.querySelector("#proprietario").value = "";
        formulario.querySelector("#pet").value = "";
        formulario.querySelector("#data_inicio").value = "";
        formulario.querySelector("#data_fim").value = "";
        formulario.querySelector("#notas").value = "";

        formulario.querySelector("#status").value = "";

        const total = document.querySelector("#totalDiarias");

        if (total) {
            total.textContent = "R$ 0,00";
        }
    });
}

// CONFIGURAÇÕES
function configurarConfiguracoes() {
    const formulario = document.querySelector("#formConfiguracoes");
    if (!formulario) return;

    const campoDiaria = document.querySelector("#valor_diaria");
    campoDiaria.value = obterValorDiaria();

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const valor = Number(campoDiaria.value);

        if (!valor || valor <= 0) {
            alert("Informe um valor de diária válido.");
            return;
        }

        localStorage.setItem(CHAVE_DIARIA, valor);
        alert("Configurações salvas com sucesso!");
        window.location.href = "tela_reserva.html";
    });
}

// PESQUISAR RESERVAS
function converterValor(texto) {
    texto = texto.replace("R$", "").trim();

    if (texto.includes(",")) {
        texto = texto.replace(/\./g, "").replace(",", ".");
    }

    return Number(texto);
}

function configurarFiltroReservas() {
    const formulario = document.querySelector("#formFiltroReservas");
    if (!formulario) return;

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const id = document.querySelector("#id").value.trim();
        const proprietario = document.querySelector("#proprietario").value.trim().toLowerCase();
        const status = document.querySelector("#status").value;
        const dataInicio = document.querySelector("#data_inicio").value;
        const dataFim = document.querySelector("#data_fim").value;
        const totalMin = document.querySelector("#total_min").value.trim();
        const totalMax = document.querySelector("#total_max").value.trim();
        const pet = document.querySelector("#pet").value.trim().toLowerCase();

        // status que contam como o mesmo no filtro
        const equivalentes = {
            "em-progresso": ["em-progresso", "andamento"],
            "finalizada": ["finalizada", "finalizado"]
        };

        const filtradas = obterReservas().filter(reserva => {
            const total = calcularTotal(reserva.dataInicio, reserva.dataFim);

            if (id && !reserva.id.includes(id)) return false;

            if (proprietario && !(reserva.proprietario || "").toLowerCase().includes(proprietario)) return false;

            if (pet && !reserva.pet.toLowerCase().includes(pet)) return false;

            if (status) {
                const aceitos = equivalentes[status] || [status];
                if (!aceitos.includes(reserva.status)) return false;
            }

            if (dataInicio && reserva.dataInicio < dataInicio) return false;
            if (dataFim && reserva.dataFim > dataFim) return false;

            if (totalMin && total < converterValor(totalMin)) return false;
            if (totalMax && total > converterValor(totalMax)) return false;

            return true;
        });

        exibirReservas(filtradas);
    });

    // botão Limpar: mostra todas de novo
    formulario.addEventListener("reset", () => {
        exibirReservas();
    });
}