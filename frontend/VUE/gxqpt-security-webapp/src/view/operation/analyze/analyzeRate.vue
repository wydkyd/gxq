<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>运维分析</BreadcrumbItem>
        <BreadcrumbItem>运维评价</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <Form
          ref="formValidate"
          inline
          :label-width="100"
          :model="searchCondition">
          <FormItem label="人员名称：">
            <div class="ivu-form-item-content" @click="openTreeModal">
              <div class="ivu-input-wrapper ivu-input-type">
                <i class="ivu-icon ivu-icon-load-c ivu-load-loop ivu-input-icon ivu-input-icon-validate"></i>
                <div class="ivu-input" style="width: 120px;">{{personInfo.title}}</div>
              </div>
            </div>
          </FormItem>
          <FormItem label="时间：">
            <Select v-model="searchCondition.time" style="width:200px">
              <Option v-for="item in timeList" :value="item" :key="item">{{item}}</Option>
            </Select>
          </FormItem>
        </Form>
        <Row>
          <Col span="4">
            <Gauge el="operationRate" ref="operationRate" :gaugeOption="operationScoreOption" title="运维评分">
              <div id="operationRate"></div>
            </Gauge>
          </Col>
          <Col span="4" :offset="1">
            <Gauge el="appRate" ref="appRate" :gaugeOption="applicationScoreOption" title="应用评分">
              <div id="appRate"></div>
            </Gauge>
          </Col>
          <Col span="4" :offset="1">
            <Gauge el="serviceRate" ref="serviceRate" :gaugeOption="serviceScoreOption" title="服务评分">
              <div id="serviceRate"></div>
            </Gauge>
          </Col>
          <Col span="4" :offset="1">
            <Gauge el="trainingRate" ref="trainingRate" :gaugeOption="trainScoreOption" title="培训评分">
              <div id="trainingRate"></div>
            </Gauge>
          </Col>
          <Col span="4" :offset="1">
            <Gauge el="referRate" ref="referRate" :gaugeOption="consultationScoreOption" title="咨询评分">
              <div id="referRate"></div>
            </Gauge>
          </Col>
        </Row>
        <Row style="margin-top: 90px;">
          <Col span="10" :offset="1">
            <bar el="historyRate" ref="historyRate" :legendDataBar="legendDataBar" :barOption="barOption" title="历史评分分析">
              <div id="historyRate"></div>
            </bar>
          </Col>
          <Col span="10" :offset="1">
            <Radar el="structureRate" ref="structureRate" :radarOption="radarOption" title="评分结构分析">
              <div id="structureRate"></div>
            </Radar>
          </Col>
        </Row>
      </Card>
      <!-- 选择人员的树形弹窗 -->
      <personTreeModal ref="getPerson" :multiple="false" @on-ok="selectPerson" />
    </Content>
  </Layout>
</template>

<script>
import {mapState} from 'vuex'
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'
// 仪表盘
import Gauge from './../echarts/Gauge.vue'
// 柱状
import bar from './../echarts/bar.vue'
// 雷达图
import Radar from './../echarts/Radar.vue'
import personTreeModal from './../trainMgr/trainModal/personTreeModal.vue'
const searchKey = {
  '当天': 'dayList',
  '本周': 'weekList',
  '本月': 'monthList',
  '本年': 'yearList'
}
const timeList = ['当天', '本周', '本月', '本年']

function getGaugeOption () {
  return {
    tooltip: {
      formatter: 9999
    },
    series: [{
      name: '',
      type: 'gauge',
      detail: {formatter:'{value}'},
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: [[0.6, '#C23531'], [0.8, '#63869E'], [1, '#91C7AE']]
        }
      }
      // data: [{value: 50, name: '完成率'}]
    }]
  }
}

const barOption = {
  xAxis: [{
    type: 'category',
    data: [],
    axisLine: {
      show: true,
      lineStyle: {
        color: "#063374",
        width: 1,
        type: "solid"
      }
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      interval:0,
      show: true,
      textStyle: {
        color: "#000",
      }
    },
  }],
  yAxis: [{
    type: 'value',
    axisLabel: {
      formatter: '{value}'
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
      lineStyle: {
        color: "#000",
        width: 2,
        type: "solid"
      },
    },
    splitLine: {
      lineStyle: {
        color: "#ddd",
      }
    }
  }],
  series: [{
    name: '评分',
    type: 'bar',
    data: [],
    barWidth: 10, //柱子宽度
    barGap: 1, //柱子之间间距
    itemStyle: {
      color: '#85C8F6',
    }
  }]
}

const radarOption = {
  radar: {
    name: {
      textStyle: {
        color: '#fff',
        backgroundColor: '#999',
        borderRadius: 3,
        padding: [3, 5]
      }
    },
    indicator: [
      { name: '运维评分', max: 100},
      { name: '应用评分', max: 100},
      { name: '服务评分', max: 100},
      { name: '培训评分', max: 100},
      { name: '咨询评分', max: 100}
    ]
  },
  series: [{
    type: 'radar',
    // data : [{
    //   value : [4300, 10000, 28000, 35000, 50000, 19000]
    // }]
  }]
}

export default {
  components: {
    Gauge,
    bar,
    Radar,
    personTreeModal
  },
  data () {
    return {
      operationScoreOption: {
        ...getGaugeOption()
      },
      applicationScoreOption: {
        ...getGaugeOption()
      },
      serviceScoreOption: {
        ...getGaugeOption()
      },
      trainScoreOption: {
        ...getGaugeOption()
      },
      consultationScoreOption: {
        ...getGaugeOption()
      },
      barOption,
      legendDataBar: [],
      radarOption,
      timeList,
      searchCondition: {
        // 时间
        time: '当天',
        // 人员名称
        userId: null
      },
      personInfo: {
        title: '',
        id: ''
      }
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  mounted() {
    this.search()
  },
  methods: {
    search () {
      const vm = this
      vm.searchCondition.userId = vm.searchCondition.userId || vm.userInfo.userId
      api(operationApiList.getOperationAnalysis, {
        ...vm.searchCondition
      }).then(res => {
        if (res.data.errcode === 0) {
          const {operationScore, applicationScore, serviceScore, trainScore, consultationScore, map} = res.data.data

          // 运维评分
          vm.operationScoreOption.series[0].data = [{
            value: parseInt(operationScore) || 0
          }]
          // 应用评分
          vm.applicationScoreOption.series[0].data = [{
            value: parseInt(applicationScore) || 0
          }]
          // 服务评分
          vm.serviceScoreOption.series[0].data = [{
            value: parseInt(serviceScore) || 0
          }]
          // 培训评分
          vm.trainScoreOption.series[0].data = [{
            value: parseInt(trainScore) || 0
          }]
          // 咨询评分
          vm.consultationScoreOption.series[0].data = [{
            value: parseInt(consultationScore) || 0
          }]

          // 历史评分分析
          vm.barOption.xAxis[0].data = map[searchKey[vm.searchCondition.time]]
          vm.barOption.series[0].data = map.data

          // 评分结构分析
          vm.radarOption.series[0].data = [{
            value:[parseInt(operationScore) || 0,
              parseInt(applicationScore) || 0,
              parseInt(serviceScore) || 0,
              parseInt(trainScore) || 0,
              parseInt(consultationScore) || 0
            ],
            name: '评分结构'
          }]

          vm.$refs.operationRate.refresh()
          vm.$refs.appRate.refresh()
          vm.$refs.serviceRate.refresh()
          vm.$refs.trainingRate.refresh()
          vm.$refs.referRate.refresh()
          vm.$refs.historyRate.refresh()
          vm.$refs.structureRate.refresh()
        }
      },(error) => {console.log(error)})
    },
    // 选择人员回调
    selectPerson(list) {
      const vm = this
      vm.searchCondition.userId = list.length > 0 ? list[0].id : ''
      vm.personInfo = list.length > 0 ? list[0] : {}
      vm.search()
    },
    // 打开树形结构，选择人员
    openTreeModal() {
      this.$refs.getPerson.open()
    }
  },
  watch:{
    'searchCondition.time' () {
      this.search()
    }
  }
}
</script>

<style lang='less' scoped>
#operationRate, #appRate, #serviceRate, #trainingRate, #referRate, #historyRate, #structureRate{
  height: 320px;
}
</style>
