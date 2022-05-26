import supertest from 'supertest';

import { app } from '../../';


describe("GET /api/symbols", () => {
    it("Binance - All Symbols", async () => {
        await supertest(app.getExpressApp())
            .get("/api/symbols")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200);
    }, 10000);
});

describe("GET /api/symbols/:symbol", () => {
    it("Binance - Valid Symbol", async () => {
        setTimeout(async () => {
            await supertest(app.getExpressApp())
                .get("/api/symbols/ETHBTC")
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .then((res) => {
                    expect(res.body).toHaveProperty("symbol");
                    expect(res.body.symbol).toBe("ETHBTC");
                });
        }, 10000);
    }, 10000);

    it("Binance - Invalid Symbol", async () => {
        await supertest(app.getExpressApp())
            .get("/api/symbols/ETHBTC1")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).toStrictEqual({});
            });;
    }, 10000);
});

afterAll(async () => {
    app.stop();
});