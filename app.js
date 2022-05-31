class incItemStructure{
    constructor( id, description, value ){
        this.id = id;
        this.description = description;
        this.value = value;
    }
}

class expItemStructure{
    constructor( id, description, value ){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    calculatePercentage( total ){

        if( total > 0 ){
            this.percentage = Math.round( (this.value / total)  * 100 );
        }

    }

}



class BudgetApp{

    data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1

    }

    createNewItem( type, description, value ){
        let id;
        let newItem;

        if( this.data.allItems[type].length === 0 ){
            id = 0;
        }else{
            id = (this.data.allItems[type].length - 1) + 1;
        }

        if( type === 'exp' ){
            newItem = new expItemStructure( id, description, value );
        }else if( type === 'inc' ){
            newItem = new incItemStructure( id, description, value );
        }

        this.data.allItems[type].push( newItem );
        
        return newItem;

    }

    deleteItem( e ){

        let target = e.target.parentNode.parentNode.parentNode.parentNode.id;
        const idArr = target.split( '-' );
        const type  = idArr[ 0 ];
        const ID    = parseInt( idArr[ 1 ] );

        this.delete( type, ID );
        this.deleteUI( target );
        updateBudget();
        this.updatePercentage();

    }

    calculateTotal( type ){

        let sum = 0;
        this.data.allItems[type].forEach( item =>{
            sum += item.value;
        } )
        return sum;

    }

    calculateBudget(){

        this.data.totals.inc = this.calculateTotal('inc');
        this.data.totals.exp = this.calculateTotal('exp');

        this.data.budget = this.data.totals.inc - this.data.totals.exp;

        this.data.percentage = -1;

        if( this.data.totals.inc > 0 ){
            this.data.percentage = Math.round( ( this.data.totals.exp / this.data.totals.inc ) * 100 )
        }

    }

    delete( type, id ){

        const IDs = this.data.allItems[type].map( item =>{
            return item.id;
        } )

        const index = IDs.indexOf( id );
        this.data.allItems[type].splice( index, 1 );

    }

    deleteUI( id ){
        document.getElementById( id ).remove();
    }

    getBudget(){
        return (
            {
                totalIncome: this.data.totals.inc,
                totalExpencess: this.data.totals.exp,
                percentage: this.data.percentage,
                budget: this.data.budget
            }
        )
    }

    getPercentage(){
        const percentages = this.data.allItems.exp.map( item => {
            return item.percentage;
        } )

        return percentages;
    }

    updatePercentage(){

        this.data.allItems.exp.forEach( item => item.calculatePercentage( this.data.totals.inc ) );

        // 1. Get the percentage
        const percentages = this.getPercentage();
    
        // 2. Update the ui
        document.querySelectorAll( '.item__percentage' ).forEach( (item, idx) =>{
            item.textContent = percentages[idx];
        } )
    }

}

class UiControl{

    constructor(){

        this.domStrings = {
            type: '.add__type',
            description: '.add__description',
            addValue: '.add__value',
            addBtn: '.add__btn',
            incContainer: '.income__list',
            expContaineer: '.expenses__list',
            budgetLabel: '.budget__value',
            incomeLabel: '.budget__income--value',
            expenseLabel: '.budget__expenses--value',
            expensePercentage: '.budget__expenses--percentage',
            container: '.container',
            month: '.budget__title--month'
        }
    
        this.state = {
            type: document.querySelector( this.domStrings.type ).value,
            description: document.querySelector( this.domStrings.description ).value,
            addValue: parseFloat( document.querySelector( this.domStrings.addValue ).value )
        }

        this.getDate();

    }

    getDate(){
        const date = new Date();

        const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

        const year = date.getFullYear();
        const month = date.getMonth();

        document.querySelector( this.domStrings.month ).textContent = months[month] + ' ' + year;

    }


    addItem( obj, type ){

        let html, container;

        if( this.state.description !== '' && !isNaN( this.state.addValue ) && this.state.addValue > 0 ){

            if( type === 'inc' ){
                container = this.domStrings.incContainer;
    
                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${this.formatNumber(obj.value, type)}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
    
            }else if( type === 'exp' ){
                container = this.domStrings.expContaineer;
    
                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${this.formatNumber(obj.value, type)}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
    
            }
    
            document.querySelector( container ).insertAdjacentHTML( 'beforeend', html );

        }

    }

    clearValues(){
        
        const fields = document.querySelectorAll( this.domStrings.description + ',' + this.domStrings.addValue );

        fields.forEach( field => {
            field.value = '';
        } )
        
        fields[0].focus();

    }

    showBudget( obj ){

        let type = obj.budget > 0 ? 'inc' : 'exp';

        document.querySelector( this.domStrings.budgetLabel ).textContent = this.formatNumber( obj.budget, type );
        document.querySelector( this.domStrings.incomeLabel ).textContent = this.formatNumber( obj.totalIncome, 'inc' );
        document.querySelector( this.domStrings.expenseLabel ).textContent = this.formatNumber( obj.totalExpencess, 'exp' );
        
        if( obj.percentage > 0 ){

            document.querySelector( this.domStrings.expensePercentage ).textContent = obj.percentage + '%';
            
        }else{
            
            document.querySelector( this.domStrings.expensePercentage ).textContent = '---';
            
        }
        

    }

    formatNumber( num, type ){

        num = Math.abs( num );
        num = num.toFixed( 2 );

        let nums = num.split( '.' );

        let int = nums[0];
        let dec = nums[1];

        if( int.length > 3 ){
            int = int.substr(0,  int.length - 3) + ',' + int.substr( int.length - 3 );
        }

        num = int + '.' + dec;

        return ( type == 'inc' ? '+' : '-' ) + num;

    }


}

const bgtCtrl = new BudgetApp;

function updateBudget(){
    
    const uiCtrl = new UiControl;
    bgtCtrl.calculateBudget();
    uiCtrl.showBudget( bgtCtrl.getBudget() );
    bgtCtrl.updatePercentage();

}

class Controller{

    constructor(){

        const uiCtrl = new UiControl;
        uiCtrl.showBudget( {
            totalIncome: 0,
            totalExpencess: 0,
            percentage: -1,
            budget: 0
        } );
        
        document.querySelector( '.add__btn' ).addEventListener( 'click', ()=> this.init() );
        document.addEventListener( 'keypress', (event) => {

            if( event.key === 'Enter' ){
                
                this.init();
            }

        } );

        document.querySelector( uiCtrl.domStrings.container ).addEventListener( 'click', (e) => {bgtCtrl.deleteItem(e)} );

    }

    init(){
        const uiCtrl = new UiControl;
        //1.Get the field input data
        const newItem = bgtCtrl.createNewItem( uiCtrl.state.type, uiCtrl.state.description, uiCtrl.state.addValue );
        //2. Clear inputs
        uiCtrl.clearValues();
        
        //2.Add item to the budget controller
        uiCtrl.addItem( newItem, uiCtrl.state.type );
        
        console.log(newItem)

        updateBudget( uiCtrl.showBudget );

        this.updatePercentage();

    }

    

}

const c = new Controller;
