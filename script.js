/* ==================================================
   SCRIPT.JS — MineHost
   Um único arquivo para todas as páginas.
   Cada bloco só roda se o elemento existir na página.
   ================================================== */
(function () {
    'use strict';

    var CHAVE_LISTA = 'minehost_assinaturas';   // todas as assinaturas feitas
    var CHAVE_ULTIMA = 'minehost_ultima';       // a assinatura mais recente
    var dinheiro = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    var reduzirMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- utilidades ---------- */

    // localStorage pode falhar (modo privado, por exemplo): sempre dentro de try/catch
    function ler(chave, padrao) {
        try {
            var texto = localStorage.getItem(chave);
            return texto ? JSON.parse(texto) : padrao;
        } catch (erro) {
            return padrao;
        }
    }

    function gravar(chave, valor) {
        try {
            localStorage.setItem(chave, JSON.stringify(valor));
            return true;
        } catch (erro) {
            return false;
        }
    }

    function arredondar(valor) {
        return Math.round(valor * 100) / 100;
    }

    function criar(tag, classe, texto) {
        var el = document.createElement(tag);
        if (classe) { el.className = classe; }
        if (texto !== undefined) { el.textContent = texto; }
        return el;
    }

    // transforma "Meu Servidor Épico" em "meu-servidor-epico"
    function fazerSlug(texto) {
        return texto
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function copiarTexto(texto) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(texto);
        }
        // plano B para navegadores antigos
        return new Promise(function (resolver, rejeitar) {
            var area = document.createElement('textarea');
            area.value = texto;
            area.setAttribute('readonly', '');
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (erro) { ok = false; }
            document.body.removeChild(area);
            ok ? resolver() : rejeitar();
        });
    }

    var NOMES_PAGAMENTO = { pix: 'Pix', cartao: 'Cartão de crédito', boleto: 'Boleto bancário' };
    var NOMES_CICLO = { 1: 'Mensal', 3: 'Trimestral', 12: 'Anual' };

    /* ---------- 1. MENU DO CELULAR ---------- */
    var botaoMenu = document.querySelector('.menu-toggle');
    var menu = document.getElementById('menu');

    if (botaoMenu && menu) {
        var fecharMenu = function () {
            menu.classList.remove('aberto');
            botaoMenu.setAttribute('aria-expanded', 'false');
            botaoMenu.setAttribute('aria-label', 'Abrir menu');
        };

        botaoMenu.addEventListener('click', function () {
            var aberto = menu.classList.toggle('aberto');
            botaoMenu.setAttribute('aria-expanded', String(aberto));
            botaoMenu.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        });

        // clicou num link do menu: fecha
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) { fecharMenu(); }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { fecharMenu(); }
        });
    }

    /* ---------- 2. BOTÃO "SAIBA MAIS" → mostra os preços ---------- */
    var btnSaibaMais = document.getElementById('btn-saiba-mais');
    var painelPrecos = document.getElementById('saiba-mais');

    if (btnSaibaMais && painelPrecos) {
        var rotulo = btnSaibaMais.querySelector('span');

        var alternarPrecos = function (abrir, rolar) {
            painelPrecos.hidden = !abrir;
            btnSaibaMais.setAttribute('aria-expanded', String(abrir));
            rotulo.textContent = abrir ? 'Ocultar preços' : 'Saiba mais';
            if (abrir && rolar) {
                painelPrecos.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth', block: 'start' });
            }
        };

        btnSaibaMais.addEventListener('click', function () {
            alternarPrecos(painelPrecos.hidden, true);
        });

        // link direto: index.html#saiba-mais já abre o painel
        if (window.location.hash === '#saiba-mais') { alternarPrecos(true, true); }
    }

    /* ---------- 3. BOTÕES DE COPIAR ---------- */
    document.addEventListener('click', function (e) {
        var botao = e.target.closest('[data-copiar]');
        if (!botao) { return; }

        var texto = botao.getAttribute('data-copiar');
        if (texto.charAt(0) === '#') {              // é o id de outro elemento
            var alvo = document.querySelector(texto);
            texto = alvo ? alvo.textContent.trim() : '';
        }

        var original = botao.getAttribute('data-rotulo') || botao.textContent.trim();
        botao.setAttribute('data-rotulo', original);

        copiarTexto(texto).then(function () {
            botao.textContent = 'Copiado!';
        }, function () {
            botao.textContent = 'Não foi possível copiar';
        }).then(function () {
            setTimeout(function () { botao.textContent = original; }, 1800);
        });
    });

    /* ---------- 4. FORMULÁRIO DE SUPORTE ---------- */
    var formSuporte = document.getElementById('form-suporte');
    var avisoSuporte = document.getElementById('suporte-ok');

    if (formSuporte && avisoSuporte) {
        formSuporte.addEventListener('submit', function (e) {
            e.preventDefault();
            var nome = formSuporte.elements['nome'].value.trim().split(' ')[0];
            avisoSuporte.textContent = 'Mensagem enviada, ' + nome + '! Respondemos por e-mail em até 24 horas.';
            avisoSuporte.hidden = false;
            formSuporte.reset();
        });
    }

    /* ---------- 5. PÁGINA DE ASSINATURA (uma por plano) ---------- */
    var form = document.getElementById('form-assinatura');

    if (form) {
        var preco = parseFloat(form.getAttribute('data-preco'));
        var planoId = form.getAttribute('data-plano');
        var planoNome = form.getAttribute('data-nome');

        var campoServidor = document.getElementById('servidor');
        var previaEndereco = document.getElementById('previa-endereco');
        var resumoCiclo = document.getElementById('resumo-ciclo');
        var resumoBruto = document.getElementById('resumo-bruto');
        var linhaDesconto = document.getElementById('linha-desconto');
        var resumoDesconto = document.getElementById('resumo-desconto');
        var resumoTotal = document.getElementById('resumo-total');
        var resumoEq = document.getElementById('resumo-eq');

        // calcula os valores de um período (1, 3 ou 12 meses)
        var calcular = function (meses, desconto) {
            var bruto = arredondar(preco * meses);
            var total = arredondar(bruto * (1 - desconto));
            return { bruto: bruto, total: total, economia: arredondar(bruto - total) };
        };

        var cicloAtual = function () {
            var marcado = form.querySelector('input[name="ciclo"]:checked');
            return {
                meses: parseInt(marcado.value, 10),
                desconto: parseFloat(marcado.getAttribute('data-desconto'))
            };
        };

        // preenche o valor dentro de cada opção de período
        form.querySelectorAll('input[name="ciclo"]').forEach(function (radio) {
            var meses = parseInt(radio.value, 10);
            var c = calcular(meses, parseFloat(radio.getAttribute('data-desconto')));
            var alvo = radio.parentNode.querySelector('[data-valor-opcao]');
            if (alvo) { alvo.textContent = dinheiro.format(c.total); }
        });

        var atualizarResumo = function () {
            var ciclo = cicloAtual();
            var c = calcular(ciclo.meses, ciclo.desconto);

            resumoCiclo.textContent = ciclo.meses === 1 ? '1 mês' : ciclo.meses + ' meses';
            resumoBruto.textContent = dinheiro.format(c.bruto);
            resumoDesconto.textContent = '− ' + dinheiro.format(c.economia);
            linhaDesconto.hidden = c.economia === 0;
            resumoTotal.textContent = dinheiro.format(c.total);
            resumoEq.textContent = ciclo.meses === 1
                ? 'Renovação mensal'
                : 'Equivale a ' + dinheiro.format(arredondar(c.total / ciclo.meses)) + ' por mês';
        };

        form.querySelectorAll('input[name="ciclo"]').forEach(function (radio) {
            radio.addEventListener('change', atualizarResumo);
        });

        // mostra o endereço do servidor enquanto o cliente digita o nome
        var atualizarEndereco = function () {
            var slug = fazerSlug(campoServidor.value);
            previaEndereco.textContent = (slug || 'nome-do-servidor') + '.minehost.gg';
        };
        campoServidor.addEventListener('input', atualizarEndereco);

        // forma de pagamento: mostra só o painel escolhido
        var atualizarPagamento = function () {
            var escolhido = form.querySelector('input[name="pagamento"]:checked').value;
            ['pix', 'cartao', 'boleto'].forEach(function (nome) {
                var painel = document.getElementById('pag-' + nome);
                var ativo = nome === escolhido;
                painel.hidden = !ativo;
                // campos desativados não entram na validação do formulário
                painel.querySelectorAll('input').forEach(function (campo) { campo.disabled = !ativo; });
            });
        };
        form.querySelectorAll('input[name="pagamento"]').forEach(function (radio) {
            radio.addEventListener('change', atualizarPagamento);
        });

        // máscaras do cartão
        var numeroCartao = document.getElementById('cartao-numero');
        var validadeCartao = document.getElementById('cartao-validade');
        var cvvCartao = document.getElementById('cartao-cvv');

        numeroCartao.addEventListener('input', function () {
            var digitos = numeroCartao.value.replace(/\D/g, '').slice(0, 16);
            numeroCartao.value = digitos.replace(/(.{4})/g, '$1 ').trim();
        });
        validadeCartao.addEventListener('input', function () {
            var d = validadeCartao.value.replace(/\D/g, '').slice(0, 4);
            validadeCartao.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
        });
        cvvCartao.addEventListener('input', function () {
            cvvCartao.value = cvvCartao.value.replace(/\D/g, '').slice(0, 4);
        });

        // botão "Confirmar assinatura"
        var botaoEnviar = form.querySelector('button[type="submit"]');
        var textoBotao = botaoEnviar.innerHTML;

        form.addEventListener('submit', function (e) {
            e.preventDefault();   // não recarrega a página; o navegador já validou os campos

            var ciclo = cicloAtual();
            var c = calcular(ciclo.meses, ciclo.desconto);
            var servidor = campoServidor.value.trim();
            var agora = new Date();

            var pedido = {
                id: 'MH' + agora.getTime().toString(36).toUpperCase(),
                plano: planoId,
                planoNome: planoNome,
                precoMensal: preco,
                meses: ciclo.meses,
                cicloNome: NOMES_CICLO[ciclo.meses],
                total: c.total,
                nome: form.elements['nome'].value.trim(),
                email: form.elements['email'].value.trim(),
                nick: form.elements['nick'].value.trim(),
                servidor: servidor,
                endereco: fazerSlug(servidor) + '.minehost.gg',
                tipo: form.elements['tipo'].value,
                regiao: form.elements['regiao'].value,
                pagamento: form.elements['pagamento'].value,
                criadoEm: agora.toISOString()
                // os dados do cartão NÃO são guardados em lugar nenhum
            };

            var lista = ler(CHAVE_LISTA, []);
            lista.push(pedido);
            gravar(CHAVE_LISTA, lista);
            gravar(CHAVE_ULTIMA, pedido);

            botaoEnviar.disabled = true;
            botaoEnviar.textContent = 'Confirmando…';
            window.location.href = 'obrigado.html';
        });

        // se o cliente voltar pelo botão "voltar" do navegador, reativa o botão
        window.addEventListener('pageshow', function () {
            botaoEnviar.disabled = false;
            botaoEnviar.innerHTML = textoBotao;
        });

        atualizarEndereco();
        atualizarResumo();
        atualizarPagamento();
    }

    /* ---------- 6. PÁGINA DE CONFIRMAÇÃO ---------- */
    var resumoPedido = document.getElementById('resumo-pedido');

    if (resumoPedido) {
        var pedido = ler(CHAVE_ULTIMA, null);
        var comPedido = document.querySelector('[data-estado="com-pedido"]');
        var semPedido = document.querySelector('[data-estado="sem-pedido"]');

        if (!pedido) {
            comPedido.hidden = true;
            semPedido.hidden = false;
        } else {
            var valores = {
                plano: 'Plano ' + pedido.planoNome,
                servidor: pedido.servidor,
                endereco: pedido.endereco,
                tipo: pedido.tipo,
                periodo: pedido.cicloNome,
                total: dinheiro.format(pedido.total),
                pagamento: NOMES_PAGAMENTO[pedido.pagamento] || pedido.pagamento,
                email: pedido.email,
                codigo: pedido.id
            };

            Object.keys(valores).forEach(function (campo) {
                var alvo = resumoPedido.querySelector('[data-campo="' + campo + '"]');
                if (alvo) { alvo.textContent = valores[campo]; }
            });

            var primeiroNome = pedido.nome.split(' ')[0];
            document.getElementById('nome-cliente').textContent = primeiroNome;

            // Pix e boleto mostram instruções diferentes
            var blocoPix = document.getElementById('bloco-pix');
            var blocoBoleto = document.getElementById('bloco-boleto');
            if (pedido.pagamento === 'pix') {
                document.getElementById('codigo-pix').textContent = 'PIX-DEMONSTRACAO-MINEHOST-' + pedido.id;
                blocoPix.hidden = false;
            } else if (pedido.pagamento === 'boleto') {
                blocoBoleto.hidden = false;
            }
        }
    }

    /* ---------- 7. PAINEL DO CLIENTE ---------- */
    var listaServidores = document.getElementById('lista-servidores');

    if (listaServidores) {
        var vazio = document.querySelector('[data-estado="vazio"]');
        var saudacao = document.getElementById('saudacao');

        var desenhar = function () {
            var lista = ler(CHAVE_LISTA, []);
            listaServidores.textContent = '';
            vazio.hidden = lista.length > 0;

            if (lista.length > 0) {
                saudacao.textContent = 'Olá, ' + lista[lista.length - 1].nome.split(' ')[0] + '! Aqui estão os seus servidores.';
            }

            // do mais novo para o mais antigo
            lista.slice().reverse().forEach(function (item) {
                // só aceita os três planos que existem (evita classe/ícone inválidos)
                var tipoPlano = ['noob', 'pro', 'hacker'].indexOf(item.plano) >= 0 ? item.plano : 'noob';
                var card = criar('article', 'servidor plano-' + tipoPlano);
                card.innerHTML = '<svg class="cubo" viewBox="0 0 64 64" aria-hidden="true"><use href="#cubo-' + tipoPlano + '"/></svg>';

                var corpo = criar('div');
                var titulo = criar('h2', '', 'Plano ' + item.planoNome + ' ');
                titulo.appendChild(criar('span', 'status', 'ATIVO'));
                corpo.appendChild(titulo);

                var dl = criar('dl', 'dados');
                [
                    ['Servidor', item.servidor],
                    ['Endereço', item.endereco],
                    ['Tipo', item.tipo],
                    ['Localização', item.regiao],
                    ['Cobrança', item.cicloNome + ' • ' + dinheiro.format(item.total)],
                    ['Pedido', item.id]
                ].forEach(function (par) {
                    var grupo = criar('div');
                    grupo.appendChild(criar('dt', '', par[0]));
                    grupo.appendChild(criar('dd', '', par[1]));
                    dl.appendChild(grupo);
                });
                corpo.appendChild(dl);
                card.appendChild(corpo);

                var botoes = criar('div', 'servidor-botoes');

                var copiar = criar('button', 'botao botao-contorno botao-pequeno', 'Copiar endereço');
                copiar.type = 'button';
                copiar.setAttribute('data-copiar', item.endereco);
                botoes.appendChild(copiar);

                var cancelar = criar('button', 'botao botao-perigo botao-pequeno', 'Cancelar assinatura');
                cancelar.type = 'button';
                var temporizador = null;
                cancelar.addEventListener('click', function () {
                    if (cancelar.getAttribute('data-confirmar') === 'sim') {
                        // segundo clique: cancela de verdade
                        var atual = ler(CHAVE_LISTA, []).filter(function (x) { return x.id !== item.id; });
                        gravar(CHAVE_LISTA, atual);
                        var ultima = ler(CHAVE_ULTIMA, null);
                        if (ultima && ultima.id === item.id) { try { localStorage.removeItem(CHAVE_ULTIMA); } catch (erro) { /* ignora */ } }
                        desenhar();
                    } else {
                        // primeiro clique: pede confirmação por 5 segundos
                        cancelar.setAttribute('data-confirmar', 'sim');
                        cancelar.textContent = 'Clique de novo para confirmar';
                        temporizador = setTimeout(function () {
                            cancelar.removeAttribute('data-confirmar');
                            cancelar.textContent = 'Cancelar assinatura';
                        }, 5000);
                    }
                });
                botoes.appendChild(cancelar);
                card.appendChild(botoes);

                listaServidores.appendChild(card);
            });
        };

        desenhar();
    }
})();
