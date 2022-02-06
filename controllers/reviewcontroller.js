const Express = require("express");
const router = Express.Router();
let validateJWT = require("../middleware/validate-jwt");
const { ReviewModel, UserModel, ProductModel } = require("../models");

router.post("/:productid", validateJWT, async (req, res) => {
  const { title, description } = req.body.review;
  const productId = req.params.productid;

  const reviewEntry = {
    title,
    description,
    userId: req.user.id,
    productId: productId,
  };
  try {
    const newReview = await ReviewModel.create(reviewEntry);
    res.status(200).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const review = await ReviewModel.findOne({
      where: {
        id: id,
      },
      include: [
        {
          model: UserModel,
        },
        { model: ProductModel },
      ],
    });

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({
      message: `Failed${error}`,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const entries = await ReviewModel.findAll();
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// router.put("/:productId", validateJWT, async (req, res) => {
//   const { description, title, price, shortDescription, image} =
//     req.body.product;
//   const productId = req.params.productId;
//   const userId = req.user.id;

//   const query = {
//     where: {
//       id: productId,
//       owner_id: userId,
//     },
//   };

//   const updatedProduct = {
//     title: title,
//     description: description,
//     price: price,
//     shortDescription: shortDescription,
//     image: image,
//   };

//   try {
//     const update = await ProductModel.update(updatedProduct, query);
//     res.status(200).json(update);
//   } catch (err) {
//     res.status(500).json({ error: err });
//   }
// });

router.delete("/:id", validateJWT, async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id;

  try {
    const query = {
      where: {
        id: reviewId,
      },
    };
    await ReviewModel.destroy(query);
    res.status(200).json({ message: "Item was deleted" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

module.exports = router;
