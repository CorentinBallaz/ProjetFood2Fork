const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema(
    {
        recipe : JSON
    });

module.exports = mongoose.model('Recipe',RecipeSchema);