import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRecordTable1723736764543 implements MigrationInterface {
    name = 'CreateRecordTable1723736764543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "record" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "fname" character varying NOT NULL, "lname" character varying NOT NULL, "userId" integer, CONSTRAINT "UQ_b2937c3c71ba49ed3f57713582a" UNIQUE ("code"), CONSTRAINT "PK_5cb1f4d1aff275cf9001f4343b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "record" ADD CONSTRAINT "FK_8675cd3761984947c2506f39a25" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "record" DROP CONSTRAINT "FK_8675cd3761984947c2506f39a25"`);
        await queryRunner.query(`DROP TABLE "record"`);
    }

}
