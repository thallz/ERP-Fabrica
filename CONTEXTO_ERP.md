# CONTEXTO DO PROJETO: ERP INDÚSTRIA DE CONGELADOS
**Data de Atualização:** Maio de 2026
**Status Atual:** Fase 1 - Modelagem de Banco de Dados e Arquitetura Inicial.

## 1. Visão Geral
Estamos construindo um ERP do zero, focado em uma fábrica de salgados congelados (B2B - venda para padarias e lanchonetes). O sistema precisa gerenciar vendas, estoque de matéria-prima, estoque de produto acabado, planejamento de produção (com explosão de receitas) e financeiro (CMV e Margem de Contribuição).

## 2. Stack Tecnológico (Obrigatório seguir)
- **Arquitetura:** API-First e Monorepo.
- **Backend:** Node.js (Express).
- **Banco de Dados:** PostgreSQL (focado em Supabase) rodando localmente/nuvem via Docker.
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla). 
- **Infraestrutura:** Docker e docker-compose obrigatórios desde o dia 1.

## 3. Regras de Design e Interface (Frontend)
- **Estética:** "SaaS Minimalista", limpo, corporativo e responsivo.
- **Tabelas e Filtros:** Devem ser à prova de falhas (atualização dinâmica sem recarregar a página ou perder cálculos).
- **Impressão vs. Excel:** Priorizar sempre layouts HTML otimizados para **impressão em papel A4** (ex: Ordens de Produção para o chão de fábrica). Não utilizar exportações para Excel para as rotinas de produção.
- **Organogramas/Fichas:** Focar em funções e metas; evitar colocar nomes de colaboradores ou matrículas em painéis permanentes, deixando o sistema focado na hierarquia e produtividade.

## 4. Regras de Negócio (Backend e Lógica)
- **Módulo Produção:** O planejamento deve comparar a meta diária/semanal de capacidade do colaborador para não sobrecarregar. 
- **Códigos de Intercorrência:** É obrigatório o uso de M1 (Falta matéria-prima), E1 (Falha equipamento), P1 (Problema Qualidade) e O1 (Outros) nas fichas de produção diárias/semanais.
- **Cálculo de Custo:** O CMV (Custo da Mercadoria Vendida) e a Margem de Contribuição são os KPIs vitais. As receitas precisam ser explodidas para deduzir insumos do almoxarifado.

## 5. Módulos do Sistema
1. **Comercial:** Cadastro de clientes B2B, emissão de pedidos e baixa em Produto Acabado.
2. **Estoque:** Dividido entre Almoxarifado (Insumos) e Câmara Fria (Produto Acabado).
3. **Produção (Chão de Fábrica):** Planejamento semanal, Ordem de Produção (OP) impressa e explosão de receitas.
4. **Financeiro:** Contas a Receber/Pagar, DRE e Dashboards.

## 6. Instruções para a IA Assistente
- Ao receber este contexto, analise em qual fase estamos e pergunte ao usuário qual o problema atual.
- Nunca gere códigos genéricos. Adapte sempre à realidade de uma fábrica de alimentos.
- Ao criar tabelas ou endpoints, valide se eles suportam o cálculo de CMV e Margem de Contribuição.
- Mantenha o código limpo, comentado e sempre informe em qual arquivo o código deve ser inserido conforme a estrutura do projeto.