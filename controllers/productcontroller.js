const Express = require("express");
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { ProductModel } = require("../models");

router.post("/", validateJWT, async (req, res) => {
  const { title, description, price, shortDescription, image } =
    req.body.product;
  const { id } = req.user;
  const productEntry = {
    title,
    description,
    price,
    image,
    shortDescription,
    owner_id: id,
  };
  try {
    const newProduct = await ProductModel.create(productEntry);
    res.status(200).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/", validateJWT, async (req, res) => {
  const { id } = req.user;
  try {
    const query = {
      where: {
        owner_id: id,
      },
    };
    const entries = await ProductModel.findAll(query);
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.put("/:productId", validateJWT, async (req, res) => {
  const { description, title, price, shortDescription, image, owner_id } =
    req.body.product;
  const productId = req.params.productId;
  const userId = req.user.id;

  const query = {
    where: {
      id: productId,
      owner_id: userId,
    },
  };

  const updatedProduct = {
    title: title,
    description: description,
    price: price,
    shortDescription: shortDescription,
    image: image,
  };

  try {
    const update = await ProductModel.update(updatedProduct, query);
    res.status(200).json(update);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.delete("/:productId", validateJWT, async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.productId;

  try {
    const query = {
      where: {
        id: productId,
        owner_id: userId,
      },
    };
    await ProductModel.destroy(query);
    res.status(200).json({ message: "Item was deleted" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;