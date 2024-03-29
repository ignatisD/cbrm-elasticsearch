import { Application } from "express";
import { Client, RequestParams, ApiResponse, NodeOptions } from "es7";
import { TransportRequestOptions, TransportRequestParams } from "es7/lib/Transport";
import { IConnector } from "@ignatisd/cbrm";
import { Agent, AgentConfigOptions } from "elastic-apm-node";
import { IBulkResponse, ICountResponse, ISearchResponse } from "./ElasticHelpers";

export class ElasticsearchConnector implements IConnector {

    private static _instance: ElasticsearchConnector;

    protected _uri: string = "http://localhost:9200";
    protected _options: any = {
        auth: null,
        debug: false
    };

    public esClient: Client;
    public esNodes: NodeOptions[] = [];
    public debug: boolean = false;

    constructor() {

    }

    public static get instance() {
        return this._instance;
    }

    private _fixNodeUri(nodes: string[]): string[] {
        return nodes.map((node) => {
            if (/^https?:/.test(node)) {
                return node;
            }
            return `http://${node}`;
        });
    }

    public init(opts: { uri: string; options: any }) {
        this._uri = opts.uri || "http://localhost:9200";
        if (opts.options) {
            this._options = {...this._options, ...opts.options};
        }
        this.esNodes = [];
        const nodes = this._fixNodeUri((this._uri).split(","));
        nodes.forEach((node: string) => {
            const url = new URL(node);
            if (this._options.auth) {
                const auth = this._options.auth.split(":");
                url.username = auth[0];
                url.password = auth[1];
            }
            this.esNodes.push({
                url: url
            });
        });
        this.esClient = new Client({
            node: this.esNodes
        });
        this.debug = this._options.debug;
        ElasticsearchConnector._instance = this;
        return Promise.resolve(ElasticsearchConnector._instance);
    }

    public onAppReady(app?: Application) {
        return Promise.resolve();
    }

    /**
     *
     * @param app
     * @param options
     * <code>
     * {
            serviceName: global.API,
            serviceVersion: "1.0.0",
            serverUrl: process.env.ELASTIC_APM_SERVER_URL,
            environment: process.env.NODE_ENV,
            frameworkName: global.API,
            frameworkVersion: process.env.BUILD,
            captureErrorLogStackTraces: "always",
            transactionSampleRate: 0.1,
            captureHeaders: false,
            captureSpanStackTraces: false,
            centralConfig: true,
            // instrument: false,
            // instrumentIncomingHTTPRequests: false,
            disableInstrumentations: [
                "ws"
            ],
            ignoreUrls: [
                "/healthcheck"
            ]
        }
     </code>
     */
    public registerAPM(app: Application, options?: AgentConfigOptions) {
        const apm: Agent = require("elastic-apm-node").start(options);
        app.use(apm.middleware.connect());
        return apm;
    }

    public onDisconnect() {
        return Promise.resolve();
    }


    async customRequest(req: TransportRequestParams) {
        return await this.esClient.transport.request(req);
    }


    async exists(params: RequestParams.Exists): Promise<ApiResponse<boolean>> {
        return await this.esClient.exists(params);
    }

    async putIndexTemplate<T = any>(template: RequestParams.IndicesPutTemplate<T>) {
        return await this.esClient.indices.put_template(template).catch((err) => {
            return err;
        });
    }
    async putMapping<T = any>(mapping: RequestParams.IndicesPutMapping<T>, clientParams: TransportRequestOptions = {ignore: [404]}) {
        return await this.esClient.indices.put_mapping(mapping, clientParams).catch((err) => {
            return err;
        });
    }
    async putPipeline<T = any>(mapping: RequestParams.IngestPutPipeline<T>) {
        return await this.esClient.ingest.put_pipeline(mapping).catch((err) => {
            return err;
        });
    }

    async create<T = any>(params: RequestParams.Create<T>) {
        return await this.esClient.create(params).catch((err) => {
            return err;
        });
    }
    async index<T = any>(params: RequestParams.Index<T>) {
        return await this.esClient.index(params).catch((err) => {
            return err;
        });
    }
    async get<R = any>(params: RequestParams.Get, clientParams: TransportRequestOptions = {ignore: [404]}): Promise<ApiResponse<R>> {
        return await this.esClient.get(params, clientParams).catch((err) => {
            return err;
        });
    }
    async search<S = any, R = any>(params: RequestParams.Search<S>, clientParams: TransportRequestOptions = {ignore: [404]}): Promise<ApiResponse<ISearchResponse<R>>> {
        return await this.esClient.search(params, clientParams).catch((err) => {
            return err;
        });
    }
    async asyncSearchSubmit<S = any, R = any>(params: RequestParams.AsyncSearchSubmit<S>, clientParams: TransportRequestOptions = {ignore: [404]}): Promise<ApiResponse<ISearchResponse<R>>> {
        return await this.esClient.asyncSearch.submit(params, clientParams).catch((err) => {
            return err;
        });
    }
    async asyncSearchGet<S = any, R = any>(params: RequestParams.AsyncSearchGet, clientParams: TransportRequestOptions = {ignore: [404]}): Promise<ApiResponse<ISearchResponse<R>>> {
        return await this.esClient.asyncSearch.get(params, clientParams).catch((err) => {
            return err;
        });
    }
    async asyncSearchDelete<S = any, R = any>(params: RequestParams.AsyncSearchDelete, clientParams: TransportRequestOptions = {ignore: [404]}): Promise<ApiResponse<ISearchResponse<R>>> {
        return await this.esClient.asyncSearch.delete(params, clientParams).catch((err) => {
            return err;
        });
    }
    async count<S = any, R = any>(params: RequestParams.Count<S>): Promise<ApiResponse<ICountResponse>> {
        return await this.esClient.count(params).catch((err) => {
            return err;
        });
    }
    async update(params: RequestParams.Update, clientParams: TransportRequestOptions = {ignore: [404]}) {
        return await this.esClient.update(params, clientParams).catch((err) => {
            return err;
        });
    }
    async updateByQuery(params: RequestParams.UpdateByQuery) {
        return await this.esClient.updateByQuery(params).catch((err) => {
            return err;
        });
    }
    async delete(params: RequestParams.Delete, clientParams: TransportRequestOptions = {ignore: [404]}) {
        return await this.esClient.delete(params, clientParams).catch((err) => {
            return err;
        });

    }
    async deleteByQuery(params: RequestParams.DeleteByQuery) {
        return await this.esClient.deleteByQuery(params).catch((err) => {
            return err;
        });
    }



    async multiSearch<S = any, R = any>(params: RequestParams.Msearch<S[]>, clientParams: TransportRequestOptions = {ignore: [404]}): Promise<ApiResponse<ISearchResponse<R>>> {
        return await this.esClient.msearch(params, clientParams).catch((err) => {
            return err;
        });
    }

    async scroll<T = any>(params: RequestParams.Scroll<T>, clientParams: TransportRequestOptions = {ignore: [404]}) {
        return await this.esClient.scroll(params, clientParams).catch((err) => {
            return err;
        });
    }

    async clearScroll(params?: RequestParams.ClearScroll, clientParams: TransportRequestOptions = {ignore: [404]}) {
        return await this.esClient.clearScroll(params, clientParams).catch((err) => {
            return err;
        });
    }

    async bulk<S = any, R = any>(params: RequestParams.Bulk<S[]>): Promise<ApiResponse<IBulkResponse>> {
        return await this.esClient.bulk(params).catch((err) => {
            return err;
        });
    }
}
