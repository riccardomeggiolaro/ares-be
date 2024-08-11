import { SchemaOptions } from "mongoose";

export const getMongoSchemaConfig = (id: boolean = true, timestamp: boolean = true, versionKey: boolean = true) => {
  const schemaOptions: SchemaOptions = { };

  if (id) {
    schemaOptions.toJSON = {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    };
    schemaOptions.toObject = {
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    };
  }

  if (timestamp) {
    schemaOptions.timestamps = true;
  }

  if (versionKey) {
    schemaOptions.versionKey = false;
  }

  return schemaOptions;
};