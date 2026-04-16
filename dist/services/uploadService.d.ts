import e from 'express';
export declare const uploadMiddleware: e.RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const uploadToS3: (file: Express.Multer.File) => Promise<string>;
//# sourceMappingURL=uploadService.d.ts.map