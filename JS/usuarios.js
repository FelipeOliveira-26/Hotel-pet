const CHAVE_USUARIOS = "hotelPetUsuarios";

function obterUsuarios() {
    return JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];
}

function guardarUsuarios(usuarios) {
    localStorage.setItem(CHAVE_USUARIOS, JSON.stringify(usuarios));
}

function nomeFuncao(funcao) {
    const nomes = {
        funcionario: "Funcionário",
        cliente: "Cliente",
        gerente: "Gerente"
    };
    return nomes[funcao] || funcao;
}

// CADASTRAR USUÁRIO
function configurarCadastroUsuario() {
    const formulario = document.querySelector("#formNovoUsuario");
    if (!formulario) return;

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const nome = document.querySelector("#nome").value.trim();
        const sobrenome = document.querySelector("#sobrenome").value.trim();
        const telefone = document.querySelector("#telefone").value.trim();
        const funcao = document.querySelector("#funcao").value;
        const arquivo = document.querySelector("#foto").files[0];

        if (!email || !nome || !telefone) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        if (obterUsuarios().some(usuario => usuario.email === email)) {
            alert("Já existe um usuário com esse email.");
            return;
        }

        if (arquivo && arquivo.size > 500 * 1024) {
            alert("A foto deve ter no máximo 500 KB.");
            return;
        }

        const salvar = (foto) => {
            const usuarios = obterUsuarios();

            usuarios.push({
                id: Date.now().toString(),
                email,
                nome,
                sobrenome,
                telefone,
                funcao,
                foto,
                status: "ativo",
                criadoEm: new Date().toISOString()
            });

            guardarUsuarios(usuarios);
            alert("Usuário salvo com sucesso!");
            window.location.href = "tela_usuario.html";
        };

        if (arquivo) {
            const leitor = new FileReader();
            leitor.onload = () => salvar(leitor.result);
            leitor.readAsDataURL(arquivo);
        } else {
            salvar("");
        }
    });
}

// EXIBIR USUÁRIOS NA TABELA
function exibirUsuarios(usuarios = obterUsuarios()) {
    const tabela = document.querySelector("#listaUsuarios");
    if (!tabela) return;
    tabela.innerHTML = "";

   usuarios.forEach(usuario => {
        const linha = document.createElement("tr");

        // checkbox
        const celulaCheckbox = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = usuario.id;
        celulaCheckbox.appendChild(checkbox);
        linha.appendChild(celulaCheckbox);

        // foto
        const celulaFoto = document.createElement("td");
        if (usuario.foto) {
            const imagem = document.createElement("img");
            imagem.src = usuario.foto;
            imagem.width = 40;
            imagem.height = 40;
            celulaFoto.appendChild(imagem);
        } else {
            celulaFoto.textContent = "-";
        }
        linha.appendChild(celulaFoto);

        // demais dados
        const dados = [
            usuario.email,
            usuario.nome + " " + usuario.sobrenome,
            usuario.telefone,
            nomeFuncao(usuario.funcao),
            usuario.status === "ativo" ? "Ativo" : "Inativo",
            new Date(usuario.criadoEm).toLocaleDateString("pt-BR")
        ];

        dados.forEach(texto => {
            const celula = document.createElement("td");
            celula.textContent = texto;
            linha.appendChild(celula);
        });

        // ações
        const acoes = document.createElement("td");

        const linkEditar = document.createElement("a");
        linkEditar.href = `editar_perfil.html?id=${encodeURIComponent(usuario.id)}`;
        linkEditar.textContent = "Editar";

        acoes.appendChild(linkEditar);
        linha.appendChild(acoes);

        tabela.appendChild(linha);
    });
}

// PEGAR OS MARCADOS
function usuariosMarcados() {
    const marcados = document.querySelectorAll("#listaUsuarios input:checked");
    return Array.from(marcados).map(checkbox => checkbox.value);
}

// REMOVER E MUDAR STATUS
function configurarBotoesUsuario() {
    const botaoRemover = document.querySelector("#botaoRemover");
    const botaoStatus = document.querySelector("#botaoStatus");

    if (botaoRemover) {
        botaoRemover.addEventListener("click", () => {
            const ids = usuariosMarcados();

            if (ids.length === 0) {
                alert("Marque pelo menos um usuário.");
                return;
            }

            if (!confirm("Deseja remover os usuários marcados?")) return;

            guardarUsuarios(obterUsuarios().filter(usuario => !ids.includes(usuario.id)));
            window.location.reload();
        });
    }

    if (botaoStatus) {
        botaoStatus.addEventListener("click", () => {
            const ids = usuariosMarcados();

            if (ids.length === 0) {
                alert("Marque pelo menos um usuário.");
                return;
            }

            const usuarios = obterUsuarios().map(usuario => {
                if (ids.includes(usuario.id)) {
                    usuario.status = usuario.status === "ativo" ? "inativo" : "ativo";
                }
                return usuario;
            });

            guardarUsuarios(usuarios);
            window.location.reload();
        });
    }
}

// EDITAR USUÁRIO
function configurarEdicaoUsuario() {
    const formulario = document.querySelector("#formEditarUsuario");
    if (!formulario) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const usuarios = obterUsuarios();
    const usuario = usuarios.find(item => item.id === id);

    if (!usuario) {
        alert("Usuário não encontrado.");
        window.location.href = "tela_usuario.html";
        return;
    }

    // preenche o formulário
    document.querySelector("#email").value = usuario.email;
    document.querySelector("#nome").value = usuario.nome;
    document.querySelector("#sobrenome").value = usuario.sobrenome;
    document.querySelector("#telefone").value = usuario.telefone;
    document.querySelector("#funcao").value = usuario.funcao;

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const nome = document.querySelector("#nome").value.trim();
        const sobrenome = document.querySelector("#sobrenome").value.trim();
        const telefone = document.querySelector("#telefone").value.trim();
        const funcao = document.querySelector("#funcao").value;
        const arquivo = document.querySelector("#foto").files[0];

        if (!email || !nome || !telefone) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        if (usuarios.some(item => item.email === email && item.id !== id)) {
            alert("Já existe um usuário com esse email.");
            return;
        }

        if (arquivo && arquivo.size > 500 * 1024) {
            alert("A foto deve ter no máximo 500 KB.");
            return;
        }

        const salvar = (foto) => {
            const indice = usuarios.findIndex(item => item.id === id);

            usuarios[indice] = {
                ...usuarios[indice],
                email,
                nome,
                sobrenome,
                telefone,
                funcao,
                foto
            };

            guardarUsuarios(usuarios);
            alert("Usuário atualizado com sucesso!");
            window.location.href = "tela_usuario.html";
        };

        if (arquivo) {
            const leitor = new FileReader();
            leitor.onload = () => salvar(leitor.result);
            leitor.readAsDataURL(arquivo);
        } else {
            salvar(usuario.foto);
        }
    });
}

// PESQUISAR USUÁRIOS
function configurarFiltroUsuarios() {
    const formulario = document.querySelector("#formFiltroUsuarios");
    if (!formulario) return;

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        
        const email = document.querySelector("#email").value.trim().toLowerCase();
        const status = document.querySelector("#status").value;
        const criadoInicio = document.querySelector("#criado_inicio").value;
        const nome = document.querySelector("#nome").value.trim().toLowerCase();
        const funcao = document.querySelector("#funcao").value;

        const filtrados = obterUsuarios().filter(usuario => {
            // data de criação no formato aaaa-mm-dd (horário local)
            const criado = new Date(usuario.criadoEm).toLocaleDateString("sv-SE");
            const nomeCompleto = (usuario.nome + " " + usuario.sobrenome).toLowerCase();

            
            if (email && !usuario.email.toLowerCase().includes(email)) return false;
            if (nome && !nomeCompleto.includes(nome)) return false;
            if (status && usuario.status !== status) return false;
            if (funcao && usuario.funcao !== funcao) return false;
            if (criadoInicio && criado < criadoInicio) return false;

            return true;
        });

        exibirUsuarios(filtrados);
    });

    // botão Limpar: mostra todos de novo
    formulario.addEventListener("reset", () => {
        exibirUsuarios();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    configurarCadastroUsuario();
    exibirUsuarios();
    configurarBotoesUsuario();
    configurarEdicaoUsuario();
    configurarFiltroUsuarios();
});