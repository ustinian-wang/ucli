import {logFdpTrack} from "@/utils/log.js";

logFdpTrack(
    'mall_mem_gds_view',
    {
        mall_free_text_0: openFrom, //访问入口
        mall_free_text_1: pinfo.name || pid + '', //产品名称
        mall_gds: gdsTxt, //产品类型
        mall_mkt_type: rtData.fdpMarketType, //营销功能名称
        mall_dist_type: fdpDistType.join(','), //分销功能名称
        mall_free_bool_0: !pdNotFound, //是否上架
        mall_free_bool_1: pinfo.mallAmount > 0, //是否有库存
    },
    true,
);