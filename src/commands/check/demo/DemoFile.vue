<template>
    <view @click="a">
        <view
            class="confirm_error_icon icon-cashpayWarn icon-xcx173"
        ></view>
        <text>
            <text>hhh</text>
        </text>
    </view>
</template>
<script>
export default {
    name: "demo",
    data(){
        return {
            wgd: {

            },

        };
    },
    methods:{
        a(){
            this.$set(this.wgd, "a", 6)
        },
    }
}
</script>
<style></style>
