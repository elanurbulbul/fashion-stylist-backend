import mongoose, { Document } from 'mongoose';
export interface ICloth extends Document {
    suggestions: {
        item?: string;
        reason?: string;
        suggestedStyle?: string;
    }[];
    s3Key: string;
    category: string;
    subCategory: string;
    color: string;
    material: string;
    style: string;
    description: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<ICloth, {}, {}, {}, mongoose.Document<unknown, {}, ICloth, {}, mongoose.DefaultSchemaOptions> & ICloth & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICloth>;
export default _default;
//# sourceMappingURL=Cloth.d.ts.map