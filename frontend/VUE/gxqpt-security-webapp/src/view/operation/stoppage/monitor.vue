<template>
  <Layout>
    <Content>
      <Breadcrumb>
        <BreadcrumbItem>故障管理</BreadcrumbItem>
        <BreadcrumbItem>故障监控</BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <Row>
          <Col span="6">
            <Gauge el="operationRate" ref="operationRate" :gaugeOption="timeOption" title="无故障持续时间(天)">
              <div id="operationRate"></div>
            </Gauge>
          </Col>
          <Col span="6">
            <Gauge el="appRate" ref="appRate" :gaugeOption="unhandledFaultOption" title="未处理故障数(个)">
              <div id="appRate"></div>
            </Gauge>
          </Col>
          <Col span="6">
            <Gauge el="serviceRate" ref="serviceRate" :gaugeOption="averageTimeOption" title="故障处理平均时长(小时)">
              <div id="serviceRate"></div>
            </Gauge>
          </Col>
          <Col span="6">
            <Gauge el="trainingRate" ref="trainingRate" :gaugeOption="dayFaultsOption" title="平均每日故障数(个)">
              <div id="trainingRate"></div>
            </Gauge>
          </Col>
        </Row>
        <Row style="margin-top: 90px;">
          <Col span="10" :offset="1">
            <bar el="stoppageNum" ref="stoppageNum" :barOption="barOption" title="故障数量分析" :legendDataBar="legendDataBar">
              <div id="stoppageNum"></div>
            </bar>
          </Col>
          <Col span="10" :offset="1">
            <bar el="sysStoppageNum" ref="sysStoppageNum" :barOption="sysbarOption" title="系统故障數量TOP5" >
              <div id="sysStoppageNum"></div>
            </bar>
          </Col>
        </Row>
      </Card>
    </Content>
  </Layout>
</template>

<script>
import api from '@/api/axiosApi'
import operationApiList from '@/api/operationApiList'
// 仪表盘
import Gauge from './../echarts/Gauge.vue'
// 柱状图
import bar from './../echarts/bar.vue'
const barOption = {
  legend: {
    data: ['已解決故障數量', '未解決故障數量'],
    bottom: '10'
  },
  xAxis: [{
    type: 'category',
    // data: [
    //   '2017/10',
    //   '2017/11',
    //   '2017/12',
    //   '2018/01',
    //   '2018/02',
    //   '2018/03',
    //   '2018/04',
    //   '2018/05',
    //   '2018/06',
    //   '2018/07',
    // ],
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
    name: '已解決故障數量',
    type: 'bar',
    // data: [20, 50, 80, 58, 83, 68, 57, 80, 42, 66],
    barWidth: 10, //柱子宽度
    barGap: 1, //柱子之间间距
    itemStyle: {
      color: '#5b9bd5',
    }
  }, {
    name: '未解決故障數量',
    type: 'bar',
    // data: [50, 70, 60, 61, 75, 87, 60, 62, 86, 46],
    barWidth: 10,
    barGap: 1,
    itemStyle: {
      color: '#ed7d31',
    }
  }],
}
const sysbarOption = {
  yAxis: [{
    type: 'category',
    // data: [
    //   '2017/10',
    //   '2017/11',
    //   '2017/12',
    //   '2018/01',
    //   '2018/02',
    //   '2018/03',
    //   '2018/04',
    //   '2018/05',
    //   '2018/06',
    //   '2018/07',
    // ],
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
  xAxis: [{
    type: 'value',
    axisLabel: {
      formatter: '{value}'
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: "#333",
        width: 1,
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
    name: '',
    type: 'bar',
    // data: [20, 50, 80, 58, 83, 68, 57, 80, 42, 66],
    barWidth: 10, //柱子宽度
    barGap: 1, //柱子之间间距
    itemStyle: {
      color: '#5b9bd5',
    }
  }]
}

function getGaugeOption () {
  return {
    // tooltip: {
    //   formatter: 9999
    // },
    series: [{
      name: '',
      type: 'gauge',
      detail: {formatter:'{value}'},
      min: 0,
      max: 100,
      // data: [{value: 50, name: '完成率'}],
      axisLine: {
        show: true,
        lineStyle:{
          // width: '10',
          color: [[0.6, '#C23531'], [0.8, '#63869E'], [1, '#91C7AE']]
        }
      }
    }]
  }
}

export default {
  components: {
    Gauge,
    bar,
  },
  data () {
    return {
      timeOption: {
        ...getGaugeOption()
      },
      unhandledFaultOption: {
        ...getGaugeOption()
      },
      averageTimeOption: {
        ...getGaugeOption()
      },
      dayFaultsOption: {
        ...getGaugeOption()
      },
      barOption,
      sysbarOption,
      legendDataBar: ['已解決故障數量', '未解決故障數量']
    }
  },
  methods: {
    search() {
      const vm = this
      api(operationApiList.getFaultMonitoring).then(res => {
        if (res.data.errcode === 0) {
          const {averageTime, time, unhandledFault, dayFaults, map, reportTopDTOList} = res.data.data

          // 无故障持续时间
          vm.timeOption.series[0].data = [{
            // name: '数量',
            value: parseInt(time) || 0
          }]
          vm.timeOption.series[0].axisLine = {
            show: true,
            lineStyle:{
              // width: '10',
              color: [[0.07, '#C23531'], [0.3, '#63869E'], [1, '#91C7AE']]
            }
          }

          // 未处理故障数
          vm.unhandledFaultOption.series[0].data = [{
            // name: '数量',
            value: parseInt(unhandledFault) || 0
          }]
          vm.unhandledFaultOption.series[0].axisLine = {
            show: true,
            lineStyle:{
              // width: '10',
              color: [[0.1, '#91C7AE'], [0.33, '#63869E'], [1, '#C23531']]
            }
          }
          vm.unhandledFaultOption.series[0].min = 0
          vm.unhandledFaultOption.series[0].max = 30

          // 故障处理平均时长
          vm.averageTimeOption.series[0].data = [{
            // name: '数量',
            value: parseInt(averageTime) || 0
          }]
          vm.averageTimeOption.series[0].axisLine = {
            show: true,
            lineStyle:{
              color: [[0.08, '#91C7AE'], [0.33, '#63869E'], [1, '#C23531']]
            }
          }
          vm.averageTimeOption.series[0].min = 0
          vm.averageTimeOption.series[0].max = 72

          // 平均每日故障数
          vm.dayFaultsOption.series[0].data = [{
            // name: '数量',
            value: Number(dayFaults) || 0
          }]
          vm.dayFaultsOption.series[0].axisLine = {
            show: true,
            lineStyle:{
              color: [[0.1, '#91C7AE'], [0.3, '#63869E'], [1, '#C23531']]
            }
          }
          vm.dayFaultsOption.series[0].min = 0
          vm.dayFaultsOption.series[0].max = 10

          // 年统计故障数
          vm.barOption.xAxis[0].data = map.monthList
          vm.barOption.series[0].data = map.data || []
          vm.barOption.series[1].data = map.wcldata || []
          // 故障数TOP5
          const systemNames = []
          const datas = []
          reportTopDTOList.reverse().map(item => {
            systemNames.push(item.systemName || 'lal')
            datas.push(item.count)
          })
          vm.sysbarOption.yAxis[0].data = systemNames
          vm.sysbarOption.series[0].data = datas
          vm.$refs.operationRate.refresh()
          vm.$refs.appRate.refresh()
          vm.$refs.serviceRate.refresh()
          vm.$refs.trainingRate.refresh()
          vm.$refs.stoppageNum.refresh()
          vm.$refs.sysStoppageNum.refresh()
        }
      },(error) => {console.log(error)})
    }
  },
  mounted() {
    this.search()
  }
}
</script>

<style lang='less' scoped>
  #operationRate,
  #appRate,
  #serviceRate,
  #trainingRate,
  #stoppageNum,
  #sysStoppageNum {
    height: 320px;
  }
</style>
