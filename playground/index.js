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

function getPhoneNumber(userId, callback) {
  setTimeout(function () {
    return callback(null, {
      phoneNumber: "1199002",
      ddd: 11,
    });
  }, 2000);
}

function getAddress(userId, callback) {
  setTimeout(function () {
    return callback(null, {
      streetName: "dos bobos",
      number: 0,
    });
  }, 2000);
}

main();
async function main() {
  try {
    console.time("medida-promise");
    const user = await getUserAsync();
    // const phoneNumber = await getPhoneNumberAsync(user.id);
    // const address = await getAddressAsync(user.id);

    const [phoneNumber, address] = await Promise.all([
      getPhoneNumberAsync(user.id),
      getAddressAsync(user.id),
    ]);

    console.log(`
        Nome: ${user.name}
        Telefone: (${phoneNumber.ddd})${phoneNumber.phoneNumber}
        Endereço: ${address.streetName}, ${address.number}
      `);
    console.timeEnd("medida-promise");
  } catch (error) {
    console.error("DEU RUIM", error);
  }
}
