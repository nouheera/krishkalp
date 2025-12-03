require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("DB Connected. Seeding...");

    await Product.deleteMany({}); // clear old

    await Product.insertMany([
      // FOOD GRAINS
      {
        name: "Rice – Kurnool",
        category: "grains",
        stock: 50,
        units: [
          { key: "kg", label: "Per 1 KG", price: 45 },
          { key: "bag25", label: "Per 25 KG Bag", price: 1350 }
        ],
        image: "images/kurnool.jpg"
      },
      {
        name: "Rice – Kurnool Special",
        category: "grains",
        stock: 30,
        units: [
          { key: "kg", label: "Per 1 KG", price: 58 },
          { key: "bag25", label: "Per 25 KG Bag", price: 1450 }
        ],
        image: "images/kurnool.jpg"
      },
      {
        name: "Rice – Fidaa",
        category: "grains",
        stock: 50,
        units: [
          { key: "kg", label: "Per 1 KG", price: 52 },
          { key: "bag25", label: "Per 25 KG Bag", price: 1300 }
        ],
        image: "images/fidaa.jpg"
      },
      {
        name: "Rice – Bullet",
        category: "grains",
        stock: 40,
        units: [
          { key: "kg", label: "Per 1 KG", price: 50 },
          { key: "bag25", label: "Per 25 KG Bag", price: 1250 }
        ],
        image: "images/bullet.jpg"
      },

      // PULSES
      {
        name: "Groundnut",
        category: "pulses",
        stock: 50,
        units: [
          { key: "kg", label: "Per 1 KG", price: 120 }
        ],
        image: "images/gn.jpeg"
      },
      {
        name: "Moong Dal",
        category: "pulses",
        stock: 40,
        units: [
          { key: "kg", label: "Per 1 KG", price: 115 }
        ],
        image: "images/moong.jpeg"
      },
      {
        name: "Channa Dal",
        category: "pulses",
        stock: 50,
        units: [
          { key: "kg", label: "Per 1 KG", price: 85 }
        ],
        image: "images/chana.jpeg"
      },
      {
        name: "Toor Dal",
        category: "pulses",
        stock: 50,
        units: [
          { key: "kg", label: "Per 1 KG", price: 110 }
        ],
        image: "images/toor.jpeg"
      },
      {
        name: "Urad Dal",
        category: "pulses",
        stock: 30,
        units: [
          { key: "kg", label: "Per 1 KG", price: 100 }
        ],
        image: "images/ud.jpeg"
      },

      // DRY FRUITS
      {
        name: "Almonds",
        category: "dryfruits",
        stock: 20,
        units: [
          { key: "250g", label: "250 g", price: 160 },
          { key: "500g", label: "500 g", price: 300 },
          { key: "kg", label: "1 KG", price: 580 }
        ],
        image: "images/almonds.jpeg"
      },
      {
        name: "Cashews",
        category: "dryfruits",
        stock: 20,
        units: [
          { key: "250g", label: "250 g", price: 180 },
          { key: "500g", label: "500 g", price: 340 },
          { key: "kg", label: "1 KG", price: 650 }
        ],
        image: "images/cashew.jpeg"
      }
    ]);

    console.log("Products seeded successfully!");
    process.exit();
  })
  .catch(err => console.log(err));
