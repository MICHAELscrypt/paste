/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r54iikb9swfb96f")

  // remove
  collection.schema.removeField("ufrmp0y3")

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("r54iikb9swfb96f")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ufrmp0y3",
    "name": "temp_key",
    "type": "text",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
})
