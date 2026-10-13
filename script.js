const HORARIO = { abre: 9, fecha: 20 }
const NUMERO_WHATSAPP = '5547999999999'

// ===== MENU NO CELULAR =====
const menuBotao = document.querySelector('#menuBotao')
const menu = document.querySelector('#menu')

function abrirFecharMenu(abrir) {
    menu.classList.toggle('aberto', abrir)
    menuBotao.setAttribute('aria-expanded', String(abrir))
    menuBotao.textContent = abrir ? 'Fechar' : 'Menu'
}

menuBotao.addEventListener('click', () => {
    abrirFecharMenu(!menu.classList.contains('aberto'))
})

menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => abrirFecharMenu(false))
})

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') abrirFecharMenu(false)
})

// ===== ABERTO OU FECHADO AGORA =====
const status = document.querySelector('#status')

function atualizarStatus() {
    const agora = new Date()
    const diaSemana = agora.getDay()
    const hora = agora.getHours() + agora.getMinutes() / 60

    let texto = ''
    let aberto = false

    if (diaSemana === 0) {
        texto = 'Fechado hoje. Abre segunda às 9h.'
    } else if (hora < HORARIO.abre) {
        texto = 'Fechado agora. Abre hoje às 9h.'
    } else if (hora < HORARIO.fecha) {
        texto = 'Aberto agora. Fecha às 20h.'
        aberto = true
    } else if (diaSemana === 6) {
        texto = 'Fechado agora. Abre segunda às 9h.'
    } else {
        texto = 'Fechado agora. Abre amanhã às 9h.'
    }

    status.textContent = texto
    status.classList.toggle('aberto', aberto)
}

atualizarStatus()

// ===== AGENDAMENTO =====
const formulario = document.querySelector('#agenda')
const campoDia = document.querySelector('#dia')
const avisoDia = document.querySelector('#avisoDia')
const listaHorarios = document.querySelector('#horarios')
const mensagemErro = document.querySelector('#erro')
const confirmacao = document.querySelector('#confirmacao')
const confirmacaoTitulo = document.querySelector('#confirmacaoTitulo')
const resumo = document.querySelector('#resumo')
const linkWhats = document.querySelector('#linkWhats')
const botaoNovo = document.querySelector('#novoAgendamento')

let horarioEscolhido = ''

function dataLocalISO(data) {
    const ano = data.getFullYear()
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const dia = String(data.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
}

function lerData(valor) {
    const [ano, mes, dia] = valor.split('-').map(Number)
    return new Date(ano, mes - 1, dia)
}

function formatarHora(minutos) {
    const h = String(Math.floor(minutos / 60)).padStart(2, '0')
    const m = String(minutos % 60).padStart(2, '0')
    return `${h}:${m}`
}

function mostrarVazio(texto) {
    listaHorarios.innerHTML = ''
    const p = document.createElement('p')
    p.className = 'vazio'
    p.textContent = texto
    listaHorarios.appendChild(p)
}

function escolherHorario(botaoEscolhido) {
    listaHorarios.querySelectorAll('.horario').forEach((botao) => {
        botao.setAttribute('aria-pressed', 'false')
    })

    botaoEscolhido.setAttribute('aria-pressed', 'true')
    horarioEscolhido = botaoEscolhido.textContent
    mensagemErro.textContent = ''
}

function gerarHorarios() {
    horarioEscolhido = ''
    avisoDia.textContent = ''

    if (!campoDia.value) {
        mostrarVazio('Escolha um dia para ver os horários.')
        return
    }

    const data = lerData(campoDia.value)
    const agora = new Date()
    const inicioDeHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())

    if (data < inicioDeHoje) {
        avisoDia.textContent = 'Escolha uma data a partir de hoje.'
        mostrarVazio('Escolha um dia para ver os horários.')
        return
    }

    if (data.getDay() === 0) {
        avisoDia.textContent = 'Não atendemos aos domingos. Escolha de segunda a sábado.'
        mostrarVazio('Escolha um dia para ver os horários.')
        return
    }

    const ehHoje = dataLocalISO(agora) === campoDia.value
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes()
    let disponiveis = 0

    listaHorarios.innerHTML = ''

    for (let minutos = HORARIO.abre * 60; minutos < HORARIO.fecha * 60; minutos += 30) {
        const botao = document.createElement('button')
        botao.type = 'button'
        botao.className = 'horario'
        botao.textContent = formatarHora(minutos)
        botao.setAttribute('aria-pressed', 'false')
        botao.disabled = ehHoje && minutos <= minutosAgora + 30

        if (!botao.disabled) disponiveis++

        botao.addEventListener('click', () => escolherHorario(botao))
        listaHorarios.appendChild(botao)
    }

    if (disponiveis === 0) {
        avisoDia.textContent = 'Hoje não há mais horários. Escolha outro dia.'
    }
}

function mostrarErro(texto) {
    mensagemErro.textContent = texto
}

function adicionarLinhaResumo(rotulo, valor) {
    const linha = document.createElement('div')
    const dt = document.createElement('dt')
    const dd = document.createElement('dd')

    dt.textContent = rotulo
    dd.textContent = valor

    linha.appendChild(dt)
    linha.appendChild(dd)
    resumo.appendChild(linha)
}

campoDia.min = dataLocalISO(new Date())
campoDia.addEventListener('change', gerarHorarios)

formulario.addEventListener('submit', (event) => {
    event.preventDefault()

    const servico = formulario.querySelector('input[name="servico"]:checked')
    const nome = document.querySelector('#nome').value.trim()
    const telefone = document.querySelector('#telefone').value.trim()
    const digitos = telefone.replace(/\D/g, '')

    if (!servico) return mostrarErro('Escolha um serviço.')
    if (!campoDia.value) return mostrarErro('Escolha um dia.')
    if (!horarioEscolhido) return mostrarErro('Escolha um horário.')
    if (!nome) return mostrarErro('Digite seu nome.')
    if (digitos.length < 10 || digitos.length > 11) {
        return mostrarErro('Digite o telefone com DDD, por exemplo (47) 99999-9999.')
    }

    mostrarErro('')

    const dataExtenso = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(lerData(campoDia.value))

    resumo.innerHTML = ''
    adicionarLinhaResumo('Serviço', servico.value)
    adicionarLinhaResumo('Dia', dataExtenso)
    adicionarLinhaResumo('Horário', horarioEscolhido)
    adicionarLinhaResumo('Nome', nome)

    const mensagem = [
        'Olá! Quero agendar um horário na Barbearia Elite.',
        `Serviço: ${servico.value}`,
        `Dia: ${dataExtenso}`,
        `Horário: ${horarioEscolhido}`,
        `Nome: ${nome}`
    ].join('\n')

    linkWhats.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensagem)}`

    formulario.hidden = true
    confirmacao.hidden = false
    confirmacaoTitulo.focus()
})

botaoNovo.addEventListener('click', () => {
    formulario.reset()
    gerarHorarios()
    confirmacao.hidden = true
    formulario.hidden = false
    formulario.scrollIntoView({ block: 'start' })
})

// ===== ANO NO RODAPÉ =====
document.querySelector('#ano').textContent = new Date().getFullYear()