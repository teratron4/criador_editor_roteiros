CRIADOR E EDITOR DE ROTEIROS

Conteúdo do projeto
- index.html: formulário para seleção de avaliação e docente, com turmas e disciplinas correspondentes.
- criando-roteiros.html: consulta aos roteiros salvos localmente neste navegador.
- sobre.html e contato.html: páginas informativas e formulário demonstrativo.
- styles.css: estilos do aplicativo. A integração não altera este arquivo nem a estrutura HTML.
- app.js: validação, organização local, diálogo de envio e conexão com o Web App.
- code.gs: serviço Google Apps Script que recebe uma turma/disciplina por chamada e grava na guia ROTEIROS.

Configuração da planilha
1. Confirme que existe uma guia chamada ROTEIROS.
2. Cada envio insere uma linha na posição 4: B data textual DD/MM/AAAA; C etapa; D AP (avaliação parcial) ou AG (avaliação global); E docente; F permanece vazia.
3. As colunas G:M correspondem a 6º ANO, 7º ANO, 8º ANO, 9º ANO, 1º ANO EM, 2º ANO EM e 3º ANO EM. Somente a coluna da turma enviada recebe o conteúdo; as demais ficam vazias. A coluna A não é modificada.
4. No Google Planilhas, abra Extensões > Apps Script, substitua o conteúdo do editor pelo conteúdo de code.gs e salve.
5. Em Implantar > Gerenciar implantações, atualize a implantação do Aplicativo da Web para a versão mais recente e confira as permissões de acesso da organização.
6. A URL fornecida foi configurada no aplicativo; não é necessário copiar outra URL, a menos que crie uma implantação diferente.
7. A URL do Web App recebida foi configurada no app.js. Para outra implantação, atualize GOOGLE_SHEETS_CONFIG.webAppUrl e mantenha o endereço com /exec no final. Publique/atualize o aplicativo; não é necessário editar HTML ou CSS.
8. Faça um envio de teste e confirme o novo registro na linha 4. Cada envio insere uma nova linha 4, deslocando os registros anteriores para baixo.

Como usar
1. Abra o aplicativo por uma origem https hospedada (não abra como arquivo local file://, pois o envio cross-origin pode ser bloqueado).
2. Selecione etapa, tipo de avaliação e docente; preencha os capítulos por disciplina.
3. Clique em VALIDAR ROTEIRO em cada disciplina preenchida e revise o texto editável.
4. Clique em ENVIAR ROTEIRO, que aparece abaixo da área editável de cada disciplina após a validação. Cada envio cria uma linha para a turma e disciplina escolhidas, mostra a confirmação e marca a disciplina como JÁ ENVIADO.

Segurança e observações
- A URL do Web App deve apontar para a implantação publicada, não para a URL de edição do Apps Script. Ao atualizar code.gs, crie uma nova versão da implantação existente.
- A implantação acessível a qualquer pessoa permite que terceiros que obtenham a URL enviem dados à planilha. Restrinja o compartilhamento/uso do aplicativo e siga as regras da escola/organização.
- A guia e os rótulos de turma devem corresponder aos nomes esperados pelo código. Cada chamada insere uma linha na posição 4 e grava conteúdo somente na coluna G:M da turma enviada; a coluna F fica sem alteração.
- A etapa RECUPERAÇÃO fica disponível a partir de outubro, conforme o mês do dispositivo.
- Roboto e Material Symbols são carregados do Google Fonts; é necessária conexão à internet para exibir as fontes e ícones correspondentes.
