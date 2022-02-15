const Express = require("express");
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { ProductModel, UserModel, ReviewModel } = require("../models");

router.post("/", validateJWT, async (req, res) => {
  const { title, description, price, amount, category, image } =
    req.body.product;

  const productEntry = {
    title,
    description,
    price,
    image,
    amount,
    category,
    userId: req.user.id,
    productId: req.body.product.productId,
  };
  try {
    const newProduct = await ProductModel.create(productEntry);
    res.status(200).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/", async (req, res) => {
  try {
    const entries = await ProductModel.findAll({
      include: [
        {
          model: UserModel,
        },
        { model: ReviewModel },
      ],
    });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const product = await ProductModel.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: UserModel,
        },
        { model: ReviewModel },
      ],
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: `Failed to fetch post: ${error}`,
    });
  }
});

router.put("/:id", validateJWT, async (req, res) => {
  const { description, title, price, amount, image } = req.body.product;
  const productId = req.params.id;
  const userId = req.user.id;

  const query = {
    where: {
      id: productId,
      userId: userId,
    },
  };

  const updatedProduct = {
    title: title,
    description: description,
    price: price,
    amount: amount,
    image: image,
  };

  try {
    const update = await ProductModel.update(updatedProduct, query);
    res.status(200).json(update);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.delete("/:id", validateJWT, async (req, res) => {
  // const userId = req.user.id;
  const productId = req.params.id;

  try {
    const query = {
      where: {
        id: productId,
        
      },
    };
    await ProductModel.destroy(query);
    res.status(200).json({ message: "Item was deleted" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
