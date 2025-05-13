import {browser} from "./browser";
import {throwRuntimeError} from "./runtime";

type CancelScanResponse<T> = chrome.documentScan.CancelScanResponse<T>;
type CloseScannerResponse<T> = chrome.documentScan.CloseScannerResponse<T>;
type DeviceFilter = chrome.documentScan.DeviceFilter;
type GetOptionGroupsResponse<T> = chrome.documentScan.GetOptionGroupsResponse<T>;
type GetScannerListResponse = chrome.documentScan.GetScannerListResponse;
type OpenScannerResponse<T> = chrome.documentScan.OpenScannerResponse<T>;
type OptionSetting = chrome.documentScan.OptionSetting;
type ReadScanDataResponse<T> = chrome.documentScan.ReadScanDataResponse<T>;
type ScanOptions = chrome.documentScan.ScanOptions;
type ScanResults = chrome.documentScan.ScanResults;
type SetOptionsResponse<T> = chrome.documentScan.SetOptionsResponse<T>;
type StartScanOptions = chrome.documentScan.StartScanOptions;
type StartScanResponse<T> = chrome.documentScan.StartScanResponse<T>;

const documentScan = () => browser().documentScan as typeof chrome.documentScan;

// Methods
export const cancelDocScanning = (job: string): Promise<CancelScanResponse<string>> => new Promise<CancelScanResponse<string>>((resolve, reject) => {
    documentScan().cancelScan(job, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const closeDocScanner = (scannerHandle: string): Promise<CloseScannerResponse<string>> => new Promise<CloseScannerResponse<string>>((resolve, reject) => {
    documentScan().closeScanner(scannerHandle, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const getDocScannerOptionGroups = (scannerHandle: string): Promise<GetOptionGroupsResponse<string>> => new Promise<GetOptionGroupsResponse<string>>((resolve, reject) => {
    documentScan().getOptionGroups(scannerHandle, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const getDocScannerList = (filter: DeviceFilter): Promise<GetScannerListResponse> => new Promise<GetScannerListResponse>((resolve, reject) => {
    documentScan().getScannerList(filter, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const openDocScanner = (scannerId: string): Promise<OpenScannerResponse<string>> => new Promise<OpenScannerResponse<string>>((resolve, reject) => {
    documentScan().openScanner(scannerId, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const readDocScanningData = (job: string): Promise<ReadScanDataResponse<string>> => new Promise<ReadScanDataResponse<string>>((resolve, reject) => {
    documentScan().readScanData(job, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const docScanning = (options: ScanOptions): Promise<ScanResults> => new Promise<ScanResults>((resolve, reject) => {
    documentScan().scan(options, (result) => {
        try {
            throwRuntimeError();

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
});

export const setDocScannerOptions = (scannerHandle: string, options: OptionSetting[]): Promise<SetOptionsResponse<string>> => new Promise<SetOptionsResponse<string>>((resolve, reject) => {
    documentScan().setOptions(scannerHandle, options, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});

export const startDocScanning = (scannerHandle: string, options: StartScanOptions): Promise<StartScanResponse<string>> => new Promise<StartScanResponse<string>>((resolve, reject) => {
    documentScan().startScan(scannerHandle, options, (response) => {
        try {
            throwRuntimeError();

            resolve(response);
        } catch (e) {
            reject(e);
        }
    });
});
