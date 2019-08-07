import { Config as DisharmonyConfig } from "disharmony"

export default interface ActivityMonitorConfig extends DisharmonyConfig
{
    cullingIntervalSec: number
}