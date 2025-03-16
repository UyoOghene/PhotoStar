const Joi = require('joi');

const postSchema = Joi.object({
    post: Joi.object({
        // title: Joi.string().required(),
        caption: Joi.string().required(),
        image: Joi.array().items(Joi.string().uri()).required(), // Array for multiple image URLs
    }).required(),
    deleteImages: Joi.array()
});

module.exports = { postSchema };

module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().required()
    }).required()
});
