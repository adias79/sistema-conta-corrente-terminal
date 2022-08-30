// modulos externos 

import chalk from 'chalk';
import inquirer from 'inquirer';

// modulos internos

import fs, { existsSync, readFileSync } from 'fs';

operations();

function operations() {
    inquirer.prompt([
       {
        type: 'list',
        name: 'action',
        message: 'Bem-vindo! O que você deseja fazer?',
        choices: [
            'Criar conta', 
            'Consultar saldo',
            'Depositar', 
            'Sacar', 
            'Sair']
       } 
    ]).then((answer) => {
        const action = answer['action'];
        
        if (action === 'Criar conta') {
            createAccount();
        } else if (action === 'Depositar') {
            deposit();
        } else if (action === 'Consultar saldo') {
            getAccountBalance();
        } else if (action === 'Sacar') {
            widthdraw();
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Até logo!'));
            process.exit();
        };
    }).catch((err) => console.log(err));
};

// create an account
function createAccount() {
    console.log(chalk.bgGreen.black('Ok! Então, vamos criar a sua conta.'));
    console.log(chalk.green('Defina as opções da sua conta a seguir'));

    buildAccount();
};

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta.'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];

        // console.info(accountName);
        if(!existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

        if(existsSync(`accounts/${accountName}.json`)) {
            console.log(
                chalk.bgRed.black('Esta conta já existe! Por favor, escolha outra conta.')
            );
            buildAccount();
            return;
        }

        fs.writeFileSync(`accounts/${accountName}.json`, 
        '{"balance" : 0}', 
        function(err) {
            console.log(err);
        })
        console.log('Parabéns! Sua conta foi criada com sucesso.');
        operations();
    }).catch((err) => console.log(err));
};

function deposit() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta.'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];

        // verify if account exists
        if(!checkAccount(accountName)) {
            return deposit();
        };

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ]).then((answer) => {
            const amount = answer['amount']

            // add an amount
            addAmount(accountName, amount);
            operations();

        }).catch((err) => console.log(err))
    }).catch((err) => console.log(err));
}

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe. Por favor, tente novamente.'));
        return false;
    }
    return true;
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if(!amount) {
        console.log(
            chalk.bgRed.black('Ocorreu um erro. Tente novamente, mais tarde.')
        )
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        }
    );

    console.log(chalk.green(`Ok! Foi depositado o valor de R$${amount} na sua conta.`));
};

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r',
    })
    
    return JSON.parse(accountJSON)
}

function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o número da conta.'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        // veriffy if account exists
        if(!checkAccount(accountName)) {
            return getAccountBalance();
        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(
            `Saldo = R$${accountData.balance}`
        ));

        operations();
    }).catch((err) => console.log(err));
}

// widthdraw an amount from user account 
function widthdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da conta.'
        }
    ]).then((answer) => {
        const accountName = answer['accountName'];

        // verify if account exists
        if(!checkAccount(accountName)) {
            return widthdraw();
        };

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ]).then((answer) => {
            const amount = answer['amount']

            // widthdraw an amount
            widthdrawAmount(accountName, amount);
            
        }).catch((err) => console.log(err))
    }).catch((err) => console.log(err));
}

function widthdrawAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if(!amount) {
        console.log(
            chalk.bgRed.black('Ocorreu um erro. Tente novamente, mais tarde.')
        )
        return widthdraw();
    }

    if(amount > accountData.balance) {
        console.log(chalk.bgRed.black('Desculpe! Valor indisponível.'));
        return operations();
    } else {
        accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);
    }

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err);
        }
    );

    console.log(chalk.green(`Ok! Foi sacado o valor de R$${amount} da sua conta.`));
    
    operations();
};
