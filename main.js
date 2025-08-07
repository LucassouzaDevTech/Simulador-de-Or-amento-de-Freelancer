// Configurações e constantes
const CONFIG = {
    baseHours: {
        landing: 8,
        website: 30,
        ecommerce: 80,
        webapp: 150,
        mobileapp: 200
    },
    marketRates: {
        landing: { min: 800, max: 2500 },
        website: { min: 2500, max: 8000 },
        ecommerce: { min: 5000, max: 25000 },
        webapp: { min: 8000, max: 40000 },
        mobileapp: { min: 12000, max: 60000 }
    },
    experienceMultipliers: {
        junior: 0.8,
        pleno: 1,
        senior: 1.3,
        specialist: 1.6
    },
    complexityMultipliers: {
        simple: 0.8,
        medium: 1,
        complex: 1.5,
        enterprise: 2
    },
    rushMultipliers: {
        normal: 1,
        rush: 1.3,
        emergency: 1.6
    }
};

// Estado global da aplicação
let currentCalculation = {
    projectType: null,
    complexity: 'medium',
    extras: [],
    hourlyRate: 75,
    experienceLevel: 'pleno',
    deadline: 30,
    rush: 'normal',
    totalPrice: 0,
    breakdown: {}
};

// Classe principal do simulador
class FreelancerBudgetSimulator {
    constructor() {
        this.form = document.getElementById('budgetForm');
        this.resultSection = document.getElementById('result');
        this.proposalSection = document.getElementById('proposal');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateFormValues();
    }
    
    bindEvents() {
        // Submit do formulário
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateBudget();
        });
        
        // Mudança nos inputs
        this.form.addEventListener('change', () => {
            this.updateFormValues();
        });
        
        // Botões de ação
        document.getElementById('generateProposal').addEventListener('click', () => {
            this.generateProposal();
        });
        
        document.getElementById('shareResult').addEventListener('click', () => {
            this.shareResult();
        });
        
        document.getElementById('newCalculation').addEventListener('click', () => {
            this.resetForm();
        });
        
        document.getElementById('copyProposal').addEventListener('click', () => {
            this.copyProposal();
        });
        
        document.getElementById('backToResult').addEventListener('click', () => {
            this.showResult();
        });
    }
    
    updateFormValues() {
        // Tipo de projeto
        const projectType = document.querySelector('input[name="projectType"]:checked');
        if (projectType) {
            currentCalculation.projectType = projectType.value;
        }
        
        // Complexidade
        const complexity = document.querySelector('input[name="complexity"]:checked');
        if (complexity) {
            currentCalculation.complexity = complexity.value;
        }
        
        // Extras
        const extras = document.querySelectorAll('input[name="extras"]:checked');
        currentCalculation.extras = Array.from(extras).map(extra => ({
            name: extra.value,
            price: parseInt(extra.dataset.price)
        }));
        
        // Configurações profissionais
        currentCalculation.hourlyRate = parseInt(document.getElementById('hourlyRate').value);
        currentCalculation.experienceLevel = document.getElementById('experienceLevel').value;
        currentCalculation.deadline = parseInt(document.getElementById('deadline').value);
        currentCalculation.rush = document.getElementById('rush').value;
    }
    
    calculateBudget() {
        if (!currentCalculation.projectType) {
            alert('Por favor, selecione um tipo de projeto!');
            return;
        }
        
        this.showLoading();
        
        // Simular delay de processamento
        setTimeout(() => {
            const calculation = this.performCalculation();
            this.displayResult(calculation);
            this.hideLoading();
        }, 1500);
    }
    
    performCalculation() {
        const { projectType, complexity, extras, hourlyRate, experienceLevel, rush } = currentCalculation;
        
        // Horas base do projeto
        const baseHours = CONFIG.baseHours[projectType];
        
        // Multiplicadores
        const complexityMultiplier = CONFIG.complexityMultipliers[complexity];
        const experienceMultiplier = CONFIG.experienceMultipliers[experienceLevel];
        const rushMultiplier = CONFIG.rushMultipliers[rush];
        
        // Cálculo das horas totais
        const totalHours = Math.ceil(baseHours * complexityMultiplier * experienceMultiplier);
        
        // Valor base
        let basePrice = totalHours * hourlyRate;
        
        // Aplicar multiplicador de urgência
        basePrice *= rushMultiplier;
        
        // Valor dos extras
        const extrasPrice = extras.reduce((sum, extra) => sum + extra.price, 0);
        
        // Preço total
        const totalPrice = basePrice + extrasPrice;
        
        // Faixa de mercado
        const marketRange = CONFIG.marketRates[projectType];
        const minPrice = Math.floor(totalPrice * 0.8);
        const maxPrice = Math.ceil(totalPrice * 1.2);
        
        // Prazo sugerido baseado nas horas
        const suggestedDeadline = Math.ceil(totalHours / 6); // 6 horas por dia
        
        // Valor efetivo por hora
        const effectiveHourlyRate = Math.round(totalPrice / totalHours);
        
        return {
            basePrice,
            extrasPrice,
            totalPrice,
            totalHours,
            minPrice,
            maxPrice,
            suggestedDeadline,
            effectiveHourlyRate,
            breakdown: this.generateBreakdown(basePrice, extrasPrice, totalHours)
        };
    }
    
    generateBreakdown(basePrice, extrasPrice, totalHours) {
        const breakdown = [];
        
        // Valor base
        breakdown.push({
            item: `Desenvolvimento (${totalHours}h)`,
            value: `R$ ${this.formatCurrency(basePrice)}`
        });
        
        // Extras
        currentCalculation.extras.forEach(extra => {
            const extraName = this.getExtraName(extra.name);
            breakdown.push({
                item: extraName,
                value: `R$ ${this.formatCurrency(extra.price)}`
            });
        });
        
        // Multiplicadores aplicados
        if (currentCalculation.rush !== 'normal') {
            const rushName = currentCalculation.rush === 'rush' ? 'Urgência (+30%)' : 'Emergência (+60%)';
            breakdown.push({
                item: rushName,
                value: 'Incluído no valor base'
            });
        }
        
        return breakdown;
    }
    
    getExtraName(extraKey) {
        const names = {
            seo: '🎯 SEO Otimização',
            cms: '📝 Sistema CMS',
            analytics: '📊 Analytics',
            responsive: '📱 Design Responsivo Premium',
            api: '🔌 Integração API',
            maintenance: '🔧 3 Meses Manutenção'
        };
        return names[extraKey] || extraKey;
    }
    
    displayResult(calculation) {
        // Atualizar valores na interface
        document.getElementById('totalPrice').textContent = `R$ ${this.formatCurrency(calculation.totalPrice)}`;
        document.getElementById('minPrice').textContent = this.formatCurrency(calculation.minPrice);
        document.getElementById('maxPrice').textContent = this.formatCurrency(calculation.maxPrice);
        document.getElementById('estimatedTime').textContent = `${calculation.totalHours} horas`;
        document.getElementById('suggestedDeadline').textContent = `${calculation.suggestedDeadline} dias`;
        document.getElementById('effectiveHourlyRate').textContent = `R$ ${calculation.effectiveHourlyRate}/hora`;
        
        // Breakdown
        const breakdownContainer = document.getElementById('breakdown');
        breakdownContainer.innerHTML = '';
        
        calculation.breakdown.forEach(item => {
            const breakdownItem = document.createElement('div');
            breakdownItem.className = 'breakdown-item';
            breakdownItem.innerHTML = `
                <span>${item.item}</span>
                <span>${item.value}</span>
            `;
            breakdownContainer.appendChild(breakdownItem);
        });
        
        // Total
        const totalItem = document.createElement('div');
        totalItem.className = 'breakdown-item';
        totalItem.innerHTML = `
            <span><strong>💰 Total</strong></span>
            <span><strong>R$ ${this.formatCurrency(calculation.totalPrice)}</strong></span>
        `;
        breakdownContainer.appendChild(totalItem);
        
        // Salvar cálculo atual
        currentCalculation.totalPrice = calculation.totalPrice;
        currentCalculation.breakdown = calculation;
        
        // Mostrar resultado
        this.resultSection.classList.remove('hidden');
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    generateProposal() {
        const projectTypeNames = {
            landing: 'Landing Page',
            website: 'Site Institucional',
            ecommerce: 'E-commerce',
            webapp: 'Aplicação Web',
            mobileapp: 'Aplicativo Mobile'
        };
        
        const complexityNames = {
            simple: 'Simples',
            medium: 'Médio',
            complex: 'Complexo',
            enterprise: 'Enterprise'
        };
        
        const projectName = projectTypeNames[currentCalculation.projectType];
        const complexityName = complexityNames[currentCalculation.complexity];
        
        const proposal = `
PROPOSTA COMERCIAL - ${projectName.toUpperCase()}

📋 RESUMO DO PROJETO
• Tipo: ${projectName}
• Complexidade: ${complexityName}
• Prazo: ${currentCalculation.breakdown.suggestedDeadline} dias úteis
• Investimento: R$ ${this.formatCurrency(currentCalculation.totalPrice)}

📊 DETALHAMENTO DO INVESTIMENTO
${currentCalculation.breakdown.breakdown.map(item => `• ${item.item}: ${item.value}`).join('\n')}

⚡ DIFERENCIAIS INCLUSOS
• Design responsivo para todos os dispositivos
• Otimização de performance e velocidade
• Testes em múltiplos navegadores
• Documentação técnica completa
• Suporte pós-entrega de 30 dias

💰 CONDIÇÕES DE PAGAMENTO
• 50% no início do projeto
• 50% na entrega final
• Forma de pagamento: PIX, transferência ou cartão

📅 CRONOGRAMA ESTIMADO
• Briefing e aprovação: 2 dias
• Desenvolvimento: ${Math.max(1, currentCalculation.breakdown.suggestedDeadline - 4)} dias
• Testes e ajustes: 2 dias
• Entrega e treinamento: 1 dia

🎯 PRÓXIMOS PASSOS
1. Aprovação da proposta
2. Assinatura do contrato
3. Pagamento da primeira parcela
4. Início do desenvolvimento

Esta proposta tem validade de 15 dias.

Atenciosamente,
[Seu Nome]
[Seu Contato]
        `.trim();
        
        document.getElementById('proposalContent').textContent = proposal;
        this.proposalSection.classList.remove('hidden');
        this.resultSection.classList.add('hidden');
        this.proposalSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    copyProposal() {
        const proposalText = document.getElementById('proposalContent').textContent;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(proposalText).then(() => {
                this.showNotification('Proposta copiada para a área de transferência!');
            }).catch(() => {
                this.fallbackCopyText(proposalText);
            });
        } else {
            this.fallbackCopyText(proposalText);
        }
    }
    
    fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Proposta copiada para a área de transferência!');
        } catch (err) {
            this.showNotification('Erro ao copiar. Selecione o texto manualmente.');
        }
        
        document.body.removeChild(textArea);
    }
    
    shareResult() {
        const shareData = {
            projectType: currentCalculation.projectType,
            complexity: currentCalculation.complexity,
            totalPrice: currentCalculation.totalPrice
        };
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?data=${btoa(JSON.stringify(shareData))}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Simulador de Orçamento Freelancer',
                text: `Orçamento calculado: R$ ${this.formatCurrency(currentCalculation.totalPrice)}`,
                url: shareUrl
            }).catch(console.error);
        } else {
            // Fallback para navegadores sem suporte ao Web Share API
            if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl).then(() => {
                    this.showNotification('Link copiado para compartilhamento!');
                }).catch(() => {
                    this.showNotification('Erro ao copiar link.');
                });
            }
        }
    }
    
    showResult() {
        this.proposalSection.classList.add('hidden');
        this.resultSection.classList.remove('hidden');
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    resetForm() {
        this.form.reset();
        this.resultSection.classList.add('hidden');
        this.proposalSection.classList.add('hidden');
        
        // Resetar estado
        currentCalculation = {
            projectType: null,
            complexity: 'medium',
            extras: [],
            hourlyRate: 75,
            experienceLevel: 'pleno',
            deadline: 30,
            rush: 'normal',
            totalPrice: 0,
            breakdown: {}
        };
        
        // Marcar complexidade média como padrão
        document.querySelector('input[name="complexity"][value="medium"]').checked = true;
        
        // Scroll para o topo
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    showLoading() {
        const button = document.querySelector('.calculate-btn');
        button.classList.add('loading');
        button.disabled = true;
    }
    
    hideLoading() {
        const button = document.querySelector('.calculate-btn');
        button.classList.remove('loading');
        button.disabled = false;
    }
    
    showNotification(message) {
        // Criar notificação temporária
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}

// Utilidades adicionais
class MarketAnalyzer {
    static getCurrentTrends() {
        // Simulação de dados de mercado atualizados
        const trends = {
            webDevelopment: {
                demand: 'high',
                averageRate: 85,
                growthRate: 0.15
            },
            mobileApps: {
                demand: 'very-high',
                averageRate: 120,
                growthRate: 0.25
            },
            ecommerce: {
                demand: 'high',
                averageRate: 95,
                growthRate: 0.20
            }
        };
        
        return trends;
    }
    
    static adjustPricesForMarket(basePrice, projectType) {
        const trends = this.getCurrentTrends();
        let adjustment = 1;
        
        switch(projectType) {
            case 'mobileapp':
                adjustment = trends.mobileApps.growthRate + 1;
                break;
            case 'ecommerce':
                adjustment = trends.ecommerce.growthRate + 1;
                break;
            default:
                adjustment = trends.webDevelopment.growthRate + 1;
        }
        
        return Math.floor(basePrice * adjustment);
    }
}

// Classe para integração com APIs externas (simulada)
class ExternalAPIIntegration {
    static async getCurrencyRates() {
        // Simulação de consulta à API de câmbio
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    USD: 5.20,
                    EUR: 5.85
                });
            }, 500);
        });
    }
    
    static async getMarketRates(projectType) {
        // Simulação de consulta à API de mercado
        return new Promise((resolve) => {
            setTimeout(() => {
                const rates = {
                    landing: { min: 800, max: 3000, avg: 1500 },
                    website: { min: 2500, max: 12000, avg: 6000 },
                    ecommerce: { min: 5000, max: 35000, avg: 15000 },
                    webapp: { min: 8000, max: 50000, avg: 20000 },
                    mobileapp: { min: 12000, max: 80000, avg: 35000 }
                };
                resolve(rates[projectType]);
            }, 800);
        });
    }
}

// Adicionar animações CSS via JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FreelancerBudgetSimulator();
    
    // Verificar se há dados compartilhados na URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');
    
    if (sharedData) {
        try {
            const data = JSON.parse(atob(sharedData));
            // Pré-preencher formulário com dados compartilhados
            if (data.projectType) {
                document.querySelector(`input[name="projectType"][value="${data.projectType}"]`).checked = true;
            }
            if (data.complexity) {
                document.querySelector(`input[name="complexity"][value="${data.complexity}"]`).checked = true;
            }
        } catch (error) {
            console.warn('Erro ao carregar dados compartilhados:', error);
        }
    }
});