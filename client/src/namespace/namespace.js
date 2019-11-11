import {createIframeClient} from '@remixproject/plugin';
import PipeProxy from './PipeProxyMetadata';
import GraphInterpreter from './GraphInterpreterMetadata';

const pipeserverIp = process.env.VUE_APP_PIPESERVER_IP;
const remixClient = createIframeClient();

const Pipeos = {
    pipeserver: {
        host: pipeserverIp,
        api: {
            json: `${pipeserverIp}/json`,
            pclass: `${pipeserverIp}/pclass`,
            pfunction: `${pipeserverIp}/pfunction`,
            pclassi: `${pipeserverIp}/pclassi`,
            tag: `${pipeserverIp}/tag`,
            project: `${pipeserverIp}/project`,
            package: `${pipeserverIp}/package`,
            graph: `${pipeserverIp}/graph`,
        },
    },
    pipem: `${process.env.VUE_APP_PIPEM_IP}/#/`,
    contracts: {
        PipeProxy,
        GraphInterpreter,
    },
    remixClient,
};

export default Pipeos;
