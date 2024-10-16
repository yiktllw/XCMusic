

declare module 'flac-metadata' {

    export class Processor {

        static MDB_TYPE_VORBIS_COMMENT: number;

        on(event: string, callback: (mdb: any) => void): void;

        push(data: any): void;

    }



    export namespace data {

        export class MetaDataBlockVorbisComment {

            static create(isLast: boolean, vendor: string, comments: string[]): MetaDataBlockVorbisComment;

            publish(): any;

        }

    }

}