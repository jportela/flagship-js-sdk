import mockAxios from 'jest-mock-axios';
import demoData from '../../../test/mock/demoData';
import testConfig from '../../config/test';
import Flagship from './flagship';
import flagshipSdk from '../../index';

let sdk: Flagship;
let visitorInstance;

describe('FlagshipVisitor', () => {
  const responseObj = {
    data: { ...demoData.decisionApi.normalResponse.oneModifInMoreThanOneCampaign },
    status: 200,
    statusText: 'OK',
  };
  afterEach(() => {
    mockAxios.reset();
  });
  describe('createVisitor function', () => {
    it('should have .once("ready") triggered also when fetchNow=false', (done) => {
      const mockFn = jest.fn();
      sdk = flagshipSdk.initSdk(demoData.envId[0], { ...testConfig, fetchNow: false });
      visitorInstance = sdk.createVisitor(demoData.visitor.id[0], demoData.visitor.cleanContext);
      visitorInstance.on('ready', () => {
        try {
          mockFn();
          expect(mockFn).toHaveBeenCalledTimes(1);
          done();
        } catch (error) {
          done.fail(error);
        }
      });
    });
    it('should have .on("saveCache") triggered when initializing with a fetchNow=true', (done) => {
      const mockFn = jest.fn();
      let modificationsWhichWillBeSavedInCache;
      sdk = flagshipSdk.initSdk(demoData.envId[0], { ...testConfig, fetchNow: true });
      visitorInstance = sdk.createVisitor(demoData.visitor.id[0], demoData.visitor.cleanContext);
      visitorInstance.on('saveCache', (args) => {
        try {
          mockFn();
          expect(mockFn).toHaveBeenCalledTimes(1);
          expect(typeof args.saveInCacheModifications).toEqual('function');
          expect(typeof args.modifications).toEqual('object');
          expect(Object.prototype.hasOwnProperty.call(args.modifications, 'before')).toEqual(true);
          expect(Object.prototype.hasOwnProperty.call(args.modifications, 'after')).toEqual(true);
          expect(Object.keys(args.modifications).length).toEqual(2);
          expect(Object.keys(args).length).toEqual(2);
          modificationsWhichWillBeSavedInCache = args.modifications.after;
        } catch (error) {
          done.fail(error);
        }
      });
      visitorInstance.once('ready', () => {
        try {
          expect(visitorInstance.fetchedModifications).toEqual(modificationsWhichWillBeSavedInCache);
          done();
        } catch (error) {
          done.fail(error);
        }
      });
      mockAxios.mockResponse(responseObj);
    });

    it('should have ability to return custom modifications with "saveCache" event', (done) => {
      const mockFn = jest.fn();
      const modificationsWhichWillBeSavedInCache = demoData.flagshipVisitor.getModifications.detailsModifications.oneModifInMoreThanOneCampaign;
      sdk = flagshipSdk.initSdk(demoData.envId[0], { ...testConfig, fetchNow: true });
      visitorInstance = sdk.createVisitor(demoData.visitor.id[0], demoData.visitor.cleanContext);
      visitorInstance.on('saveCache', (args) => {
        try {
          mockFn();
          expect(mockFn).toHaveBeenCalledTimes(1);
          expect(typeof args.saveInCacheModifications).toEqual('function');
          expect(typeof args.modifications).toEqual('object');
          expect(Object.prototype.hasOwnProperty.call(args.modifications, 'before')).toEqual(true);
          expect(Object.prototype.hasOwnProperty.call(args.modifications, 'after')).toEqual(true);
          expect(Object.keys(args.modifications).length).toEqual(2);
          expect(Object.keys(args).length).toEqual(2);
          args.saveInCacheModifications(modificationsWhichWillBeSavedInCache);
        } catch (error) {
          done.fail(error);
        }
      });
      visitorInstance.once('ready', () => {
        try {
          expect(visitorInstance.fetchedModifications).toEqual(modificationsWhichWillBeSavedInCache);
          done();
        } catch (error) {
          done.fail(error);
        }
      });
      mockAxios.mockResponse(responseObj);
    });


    it('should return default modificaitons if user badly use "saveCache" event', (done) => {
      const mockFn = jest.fn();
      let modificationsWhichWillBeSavedInCache;
      sdk = flagshipSdk.initSdk(demoData.envId[0], { ...testConfig, fetchNow: true });
      visitorInstance = sdk.createVisitor(demoData.visitor.id[0], demoData.visitor.cleanContext);
      visitorInstance.on('saveCache', (args) => {
        try {
          mockFn();
          expect(mockFn).toHaveBeenCalledTimes(1);
          expect(typeof args.saveInCacheModifications).toEqual('function');
          expect(typeof args.modifications).toEqual('object');
          expect(Object.prototype.hasOwnProperty.call(args.modifications, 'before')).toEqual(true);
          expect(Object.prototype.hasOwnProperty.call(args.modifications, 'after')).toEqual(true);
          expect(Object.keys(args.modifications).length).toEqual(2);
          expect(Object.keys(args).length).toEqual(2);
          modificationsWhichWillBeSavedInCache = args.modifications.after;
          args.saveInCacheModifications();
        } catch (error) {
          done.fail(error);
        }
      });
      visitorInstance.once('ready', () => {
        try {
          expect(visitorInstance.fetchedModifications).toEqual(modificationsWhichWillBeSavedInCache);
          done();
        } catch (error) {
          done.fail(error);
        }
      });
      mockAxios.mockResponse(responseObj);
    });
    it('should create a Visitor with modifications already loaded if config "fetchNow=true"', (done) => {
      const responseObj = {
        data: { ...demoData.decisionApi.normalResponse.oneModifInMoreThanOneCampaign },
        status: 200,
        statusText: 'OK',
      };
      sdk = flagshipSdk.initSdk(demoData.envId[0], { ...testConfig, fetchNow: true });
      visitorInstance = sdk.createVisitor(demoData.visitor.id[0], demoData.visitor.cleanContext);
      expect(visitorInstance.config).toMatchObject({ ...testConfig, fetchNow: true });
      visitorInstance.once('ready', () => {
        done();
      });
      mockAxios.mockResponse(responseObj);
      expect(visitorInstance.fetchedModifications).toMatchObject(responseObj.data);
    });
    it('should create a Visitor with modifications already loaded and activated if config "activateNow=true"', (done) => {
      sdk = flagshipSdk.initSdk(demoData.envId[0], { ...testConfig, activateNow: true });
      visitorInstance = sdk.createVisitor(demoData.visitor.id[0], demoData.visitor.cleanContext);
      expect(visitorInstance.config).toMatchObject({ ...testConfig, activateNow: true });
      visitorInstance.once('ready', () => {
        try {
          expect(visitorInstance.fetchedModifications).not.toBe(null);
          expect(mockAxios.post).toHaveBeenNthCalledWith(2, 'https://decision-api.flagship.io/v1/activate', {
            caid: 'blntcamqmdvg04g371hg', cid: 'bn1ab7m56qolupi5sa0g', vaid: 'blntcamqmdvg04g371h0', vid: 'test-perf',
          });
          expect(mockAxios.post).toHaveBeenNthCalledWith(3, 'https://decision-api.flagship.io/v1/activate', {
            caid: 'bmjdprsjan0g01uq2ctg', cid: 'bn1ab7m56qolupi5sa0g', vaid: 'bmjdprsjan0g01uq2csg', vid: 'test-perf',
          });
          expect(mockAxios.post).toHaveBeenNthCalledWith(4, 'https://decision-api.flagship.io/v1/activate', {
            caid: 'bmjdprsjan0g01uq1ctg', cid: 'bn1ab7m56qolupi5sa0g', vaid: 'bmjdprsjan0g01uq2ceg', vid: 'test-perf',
          });
          done();
        } catch (error) {
          done.fail(error);
        }
      });
      mockAxios.mockResponse(responseObj);
      expect(mockAxios.post).toHaveBeenNthCalledWith(1, `https://decision-api.flagship.io/v1/${demoData.envId[0]}/campaigns?mode=normal`, { context: demoData.visitor.cleanContext, trigger_hit: true, visitor_id: demoData.visitor.id[0] });
      expect(visitorInstance.fetchedModifications).toMatchObject(responseObj.data);
    });
  });
});