# Módulo 1

## Introdução

Etapas da transformação

![Transformação do JS para C++]("./images/modulo-1/JS-to-C++.png")

Todas as operações bloqueantes (acesso a BD, leitura de arquivos...) são delegadas ao sistema operacional por meio do Event Loop. Quando a operação é finalizada o sistema operacional envia um Callback (sinalizando que terminou) para o Event Loop que devolve para quem chamou.

Isso gera um problema de sincronização.

> A forma com que seu código é escrito é diferente da ordem em que é executado.

Portanto, é necessário garantir a ordem de execução para evitar problemas (retornos indesejados).

![Event Loop]("./images/modulo-1/event-loop.png")

Para manipulação do Event Loop (delegação de eventos) é utilizada somente uma Thread (SingleThread), mas quem trabalha com as Threads é o próprio SO (Sistema Operacional).

## Estudo dos Callbacks

```
/*
 1 Obter um usuario
 2 Obter o numero de telefone de um usuario a partir de seu Id
 3 Obter o endereco do usuario pelo Id
*/

function getUser() {
  setTimeout(function () {
    return {
      id: 1,
      name: "Aladin",
      birthDate: new Date(),
    };
  }, 1000);
}

function getPhoneNumber(userId) {
  setTimeout(function () {
    return {
      phoneNumber: "1199002",
      ddd: 11,
    };
  }, 2000);
}

function getAddress(userId, callback) {
  setTimeout(function () {
    return {
      streetName: "dos bobos",
      number: 0,
    };
  }, 2000);
}

const user = getUser();
const phoneNumber = getPhoneNumber(user.id);

// Nesse caso usuário irá retornar undefined
console.log(`Usuário: ${user}`); // console.log("Usuário", user);
console.log(`Telefone: ${phoneNumber}`); // console.log("Telefone", phoneNumber);
```

Retorno:
![Usuário undefined]("./images/modulo-1/user-undefined.png")

Para resolver esse problema pode-se utilizar o Callback.

```
function getUser(callback) {
  setTimeout(function () {
    return callback(null, {
      id: 1,
      name: "Aladin",
      birthDate: new Date(),
    });
  }, 1000);
}

function resolveUser(error, user) {
  console.log(`Usuário: ${user}`);
}

getUser(resolveUser);
```

Cria-se uma segunda função (que será o Callback) e essa função é passada para a função getUser, para ser executada quando finalizado.

![Uso de Callback para retornar usuário]("./images/modulo-1/user-callback.png")

```
function getUser(callback) {
  setTimeout(function () {
    return callback(null, {
      id: 1,
      name: "Aladin",
      birthDate: new Date(),
    });
  }, 1000);
}

function getPhoneNumber(userId, callback) {
  setTimeout(function () {
    return callback(null, {
      phoneNumber: "1199002",
      ddd: 11,
    });
  }, 2000);
}

getUser(function resolveUser(error, user) {
  if (error) {
    console.error("DEU RUIM EM USUÁRIO", error);
    return;
  }

  getPhoneNumber(user.id, function resolvePhoneNumber(error1, phoneNumber) {
    if (error1) {
      console.error("DEU RUIM EM TELEFONE", error);
      return;
    }
  });
});
```

A função resolveUser que se comporta como a função Callback é passada para getUser, se retornar erro printa o erro e segue, senão chama a função getPhoneNumber, passa o id do usuário e também passa o Callback que é esperado pela função getPhoneNumber.

É possível notar que o callback é sempre passado como último parâmetro.

![Uso de Callback para retornar número de telefone]("./images/modulo-1/phone-number-callback.png")

Por fim, faz-se o mesmo com endereço.

![Uso de Callback para retornar endereço]("./images/modulo-1/address-callback.png")

Depois de todos os Callbacks construídos e aninhados, é possível visualizar todos os dados.

![Informações do usuário]("./images/modulo-1/all-informations-printed.png")

Porém, isso traz um problema. A quantidade de aninhamentos, mesmo que somente com 3 funções, já se torna difícil de manter e debuggar.

Os Callbacks resolvem o problema de sincronia, porém dificultam organização, manutenção e debuggação do código.

## Introdução a Promises

### Ciclo de vida

- 🕙 Pending: Estado inicial, ainda não terminou ou ainda não foi rejeitado.
- 🎉 Fulfilled: Quando executou todas as operações com sucesso.
- ❌ Rejected: Quando a operação falhou.

Ao refatorar o código de Callback para Promise, temos o seguinte:

```
function getUser() {
  return new Promise(function resolvePromise(resolve, reject) {
    setTimeout(function () {
      return resolve({
        id: 1,
        name: "Aladin",
        birthDate: new Date(),
      });
    }, 1000);
  });
}

const userPromise = getUser();

userPromise
  .then(function (result) {
    console.log("resultado", result);
  })
  .catch(function (error) {
    console.error("DEU RUIM", error);
  });

```

![Refatoração do Callback de Usuário para Promise]("./images/modulo-1/user-promise.png")

O objeto Promise é instanciado e nele é passado uma função que irá retornar duas funções: a função responsável por lidar com o resultado e a função responsável por lidar com o erro. Nisso, há uma separação de responsabilidades. Para capturar o resultado utiliza-se **then** e para capturar o erro **catch**. É possível também lidar com o erro pelo **then**, como exemplo abaixo:

```
userPromise
    .then(function(result) {
        //do something...
    }, function (error) {
        //do something...
    })
```

Se na função for retornado o reject, o erro é mostrado pois é capturado pelo catch:

```
function getUser() {
  return new Promise(function resolvePromise(resolve, reject) {
    setTimeout(function () {
      return reject(new Error("DEU RUIM DE VERDADE!"));

      return resolve({
        id: 1,
        name: "Aladin",
        birthDate: new Date(),
      });
    }, 1000);
  });
}
```

![Retorno de erro na Promise de Usuário]("./images/modulo-1/user-promise-error.png")

Refatorando tudo para utilizar somente Promises:

```
function getUser() {
  return new Promise(function resolvePromise(resolve, reject) {
    setTimeout(function () {
      // return reject(new Error("DEU RUIM DE VERDADE!"));

      return resolve({
        id: 1,
        name: "Aladin",
        birthDate: new Date(),
      });
    }, 1000);
  });
}

function getPhoneNumber(userId) {
  return new Promise(function resolvePromise(resolve, reject) {
    setTimeout(function () {
      return resolve({
        phoneNumber: "1199002",
        ddd: 11,
      });
    }, 2000);
  });
}

function getAddress(userId) {
  return new Promise(function resolvePromise(resolve, reject) {
    setTimeout(function () {
      return resolve({
        streetName: "dos bobos",
        number: 0,
      });
    }, 2000);
  });
}

const userPromise = getUser();

//CONCEITO DE PIPE:
// usuario -> telefone -> endereço
userPromise
  .then(function (user) {
    return getPhoneNumber(user.id).then(function (phoneNumber) {
      return getAddress(user.id).then(function (address) {
        return {
          user: {
            id: user.id,
            name: user.name,
          },
          phoneNumber: `(${phoneNumber.ddd})${phoneNumber.phoneNumber}`,
          address: `${address.streetName}, ${address.number}`,
        };
      });
    });
  })
  .then(function (result) {
    console.log("Resultado", result);
  })
  .catch(function (error) {
    console.error("DEU RUIM", error);
  });
```

![Resultado com Promises]("./images/modulo-1/all-promises.png")

O próprio Node.js possui um módulo interno que auxilia na transformação de Callback para Promise, sem que precisemos instanciar em toda função.

```
const util = require("util");

const getAddressAsync = util.promisify(getAddress);
const getUserAsync = util.promisify(getUser);
const getPhoneNumberAsync = util.promisify(getPhoneNumber);

function getUser(callback) {
  setTimeout(function () {
    return callback(null, {
      id: 1,
      name: "Aladin",
      birthDate: new Date(),
    });
  }, 1000);
}

...
```

Cada função passada para promisify é referente ao Callback como visto inicialmente. O resultado retornado é uma Promise.

```
userPromise
  .then(function (user) {
    const phoneNumberPromise = getPhoneNumberAsync(user.id);
    return phoneNumberPromise.then(function (phoneNumber) {
      const addressPromise = getAddressAsync(user.id);
      return addressPromise.then(function (address) {
        return {
          user: {
            id: user.id,
            name: user.name,
          },
          phoneNumber: `(${phoneNumber.ddd})${phoneNumber.phoneNumber}`,
          address: `${address.streetName}, ${address.number}`,
        };
      });
    });
  })
  .then(function (result) {
    console.log("Resultado", result);
  })
  .catch(function (error) {
    console.error("DEU RUIM", error);
  });
```

Se o primeiro parâmetro do Callback da função que retorna o Callback, for diferente de nulo, ao invés de printar o resultado, ele vai printar o erro.

```
function getUser(callback) {
  setTimeout(function () {
    return callback(345345345, {
      id: 1,
      name: "Aladin",
      birthDate: new Date(),
    });
  }, 1000);
}
```

Portanto, ao invés de cair no then result, irá cair no catch error.

O Promisify só funciona corretamente se estiver sendo utilizado o Callback da forma esperada (convencional).

Mesmo assim, ainda é difícil de gerenciar e manter, com muitos aninhamentos, tendo que sempre resolver uma promise para resolver outra.

## Introdução de Promises com async/await

```
main();
async function main() {
  try {
    const user = await getUserAsync();
    const phoneNumber = await getPhoneNumberAsync(user.id);
    const address = await getAddressAsync(user.id);

    console.log(`
        Nome: ${user.name}
        Telefone: (${phoneNumber.ddd})${phoneNumber.phoneNumber}
        Endereço: ${address.streetName}, ${address.number}
      `);
  } catch (error) {
    console.error("DEU RUIM", error);
  }
}
```

A sintaxe async/await vem como um facilitador na hora de trabalhar com Promises, reduzindo código e complexidade. Porém, uma chamada await pode interromper todo um fluxo, e é nessas horas que necessita verificar quem depende de quem.

No código acima, pode-ser ter uma melhoria no tempo de resposta utilizando a função Promise.all.

```

main();
async function main() {
  try {
    const user = await getUserAsync();

    const [phoneNumber, address] = await Promise.all([
      getPhoneNumberAsync(user.id),
      getAddressAsync(user.id),
    ]);

    console.log(`
        Nome: ${user.name}
        Telefone: (${phoneNumber.ddd})${phoneNumber.phoneNumber}
        Endereço: ${address.streetName}, ${address.number}
      `);
  } catch (error) {
    console.error("DEU RUIM", error);
  }
}

```

Como endereço não depende da resolução da Promise de telefone, é possível colocar ambas as funções na fila de Promises. Portanto, não terá o tempo de espera a mais (somente da própria Promise).

Diferença de tempo de resposta entre ambos os casos:

![Tempo de resposta maior com async/await]("./images/modulo-1/async-await-longer.png")

![Tempo de resposta menor com async/await]("./images/modulo-1/async-await-shorter.png")

## Manipulação de eventos com EventEmitter

Tudo que ocorre e é manipulado no JavaScript ocorre a partir de eventos, portanto ele é Event Driven (Orientado a Eventos).

Trabalha sob o Design Pattern Observer/PubSub.

![Observer Design Pattern]("./images/modulo-1/observer.png")

Primeiro exemplo:

```

const EventEmitter = require("events");

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
const userClicked = "usuario:click";

myEmitter.on(userClicked, function (click) {
  console.log("um usuario clicou", click);
});

myEmitter.emit(userClicked, "na barra de rolagem");
myEmitter.emit(userClicked, "no ok");

let count = 0;
setInterval(function () {
  myEmitter.emit(userClicked, "no ok" + count++);
}, 1000);

```

Segundo exemplo:

```
const stdin = process.openStdin();

stdin.addListener("data", function (value) {
    console.log(`Você digitou: ${value.toString().trim()}`);
    return resolve(value);
});

```

Enquanto receber eventos, será executado, diferente da Promise que executa uma vez.

```
const stdin = process.openStdin();

function main() {
  return new Promise(function (resolve, reject) {
    stdin.addListener("data", function (value) {
      return resolve(value);
    });
  });
}

main().then(function (result) {
  console.log("resultado", result.toString());
});
```

Mesmo que exista um Listener, por ser uma Promise, será executado somente uma vez.
