const axios = require('axios');
axios.get("https://www.apishop.net/#/api/detail/?productID=76").then(val => {
    console.log(val.data);
}).catch(err => {
    console.log(err);
})