import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import IconPublic from '@material-ui/icons/Public';
import IconPerson from '@material-ui/icons/RecordVoiceOver';
import './App.css';
import DualChart from './d3/DualChart';
import { csv } from 'd3-fetch';
import { byAlpha3 } from "iso-country-codes";
import AutoSelect from './components/AutoSelect';

import { queryGBIF } from "./api/gbif";

/**
 * V-dem variables
 * country,year,v2x_regime,v2x_freexp_altinf,v2x_frassoc_thick,v2x_rule,v2xcl_dmove,v2xcs_ccsi,v2x_corr,v2x_clphy,e_area,e_regiongeo,e_peaveduc,e_migdppc,e_peginiwi,e_wri_pa,e_population,e_Civil_War,e_miinterc,confl
AFG,1960,0,0.190868685410209,0.125512007338669,0.368635436412438,0.266093357150313,0.242432454719204,0.48274120527295,0.37271631597475,NA,14,0.31028929,2744,NA,NA,9616e3,0,0,0
AFG,1961,0,0.18535179976794,0.129522240943792,0.368635436412438,0.266093357150313,0.268914369944661,0.48274120527295,0.37271631597475,652090,14,0.340960361,2708,NA,NA,9799e3,0,0,0
 */
const vdemDataUrl = `${process.env.PUBLIC_URL}/data/vdem_variables.csv`;
// const vdemDataUrl = `https://raw.githubusercontent.com/AntonelliLab/Vdem-Biodiversity/master/analyses/input/vdem_variables.csv?token=AG-YjnEhdZQC1HdaThLt5uEBQRmdT1zLks5bV-6-wA%3D%3D`;

const vdemOptions = [
  { value: 'v2x_regime', label: 'v2x_regime' },
  { value: 'v2x_freexp_altinf', label: 'v2x_freexp_altinf' },
  { value: 'v2x_frassoc_thick', label: 'v2x_frassoc_thick' },
  { value: 'v2x_rule', label: 'v2x_rule' },
  { value: 'v2xcl_dmove', label: 'v2xcl_dmove' },
  { value: 'v2xcs_ccsi', label: 'v2xcs_ccsi' },
  { value: 'v2x_corr', label: 'v2x_corr' },
  { value: 'v2x_clphy', label: 'v2x_clphy' },
  { value: 'e_area', label: 'e_area' },
  { value: 'e_regiongeo', label: 'e_regiongeo' },
  { value: 'e_peaveduc', label: 'e_peaveduc' },
  { value: 'e_migdppc', label: 'e_migdppc' },
  { value: 'e_peginiwi', label: 'e_peginiwi' },
  { value: 'e_wri_pa', label: 'e_wri_pa' },
  { value: 'e_population', label: 'e_population' },
  { value: 'e_Civil_War', label: 'e_Civil_War' },
  { value: 'e_miinterc', label: 'e_miinterc' },
  { value: 'conf', label: 'conf' },
];

const BioDemLogo = () => (
  <span style={{ position: 'relative', marginLeft: 5, marginRight: 5 }}>
    <span style={{ position: 'absolute', left: 2, top: -11 }}>
      <IconPerson />
    </span>
    <IconPublic />
  </span>
);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      gbifData: [],
      vdemData: [],
      loaded: false,
      fetching: false,
      country: 'SWE',
      vdemVariable: 'v2x_freexp_altinf',
      countries: [],
    };
  }

  async fetchData() {
    if (this.data) {
      return this.data;
    }
    this.setState({
      fetching: true,
    });
    await this.makeQuery('SE');
    const vdemData = csv(vdemDataUrl, row => {
      const year = +row.year;
      if (Number.isNaN(year)) {
        return null;
      }
      return {
        country: row.country,
        year: +row.year,
        v2x_regime: +row.v2x_regime,
        v2x_freexp_altinf: +row.v2x_freexp_altinf,
        v2x_frassoc_thick: +row.v2x_frassoc_thick,
        v2x_rule: +row.v2x_rule,
        v2xcl_dmove: +row.v2xcl_dmove,
        v2xcs_ccsi: +row.v2xcs_ccsi,
        v2x_corr: +row.v2x_corr,
        v2x_clphy: +row.v2x_clphy,
        e_area: +row.e_area,
        e_regiongeo: +row.e_regiongeo,
        e_peaveduc: +row.e_peaveduc,
        e_migdppc: +row.e_migdppc,
        e_peginiwi: +row.e_peginiwi,
        e_wri_pa: +row.e_wri_pa,
        e_population: +row.e_population,
        e_Civil_War: +row.e_Civil_War,
        e_miinterc: +row.e_miinterc,
        conf: +row.confl,
      };
    });
    const data = await Promise.all([vdemData]);
    this.data = data;
    this.setState({
      loaded: true,
      fetching: false,
    });
    return data;
  }

  makeQuery = async (country) => {
    // Query the GBIF API
    console.log('Query gbif...');
    this.setState({ fetching: true });
    const result = await queryGBIF(country);
    console.log('received gbif data:', result);
    if (result.error) {
      // TODO: request errored out => handle UI
      return;
    }
    const gbifData = result.response.data.facets[0].counts.map(d => ({
      year: +d.name,
      collections: +d.count,
    }));
    this.setState({ gbifData, fetching: false });
  }

  async initData() {
    const data = await this.fetchData();
    const [vdemData] = data;
    const countries = {};
    vdemData.forEach(d => {
      countries[d.country] = 1;
    });
    this.setState({
      vdemData,
      countries: Object.keys(countries),
    }, () => {
      this.renderChart();
    });
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.renderChart();
    });
  }

  handleCountryChange = async (event) => {
    console.log('querying for this country: ', event.target.value);
    this.setState({
      [event.target.name]: event.target.value,
      fetching: true,
    });
    // Get alpha2 ISO code for this country, as this is what GBIF requires as query
    // TODO: Catch cases where !byAlpha3[event.target.value]
    const alpha2 = byAlpha3[event.target.value].alpha2;
    await this.makeQuery(alpha2);
    // Set new country value to state
    this.setState({
      fetching: false,
    }, () => {
      this.renderChart();
    });
  }

  async componentDidMount() {
    await this.initData();
  }

  renderChart() {
    const { gbifData, vdemData, fetching } = this.state;
    
    const vdemFiltered = vdemData
      .filter(d => d.country === this.state.country)
    
    const yearMin = 1960;
    const yearMax = 2018;
    
    const gbifDataFiltered = gbifData
      .filter(d => d.year >= yearMin && d.year <= yearMax)
      .sort((a,b) => a.year - b.year)
    
    console.log('renderChart with fethcing:', fetching);
    DualChart('#chart', {
      data: gbifDataFiltered,
      secondData: vdemFiltered,
      height: 300,
      xMin: yearMin,
      x: d => d.year,
      y: d => d.collections,
      x2: d => d.year,
      y2: d => d[this.state.vdemVariable],
      yLabel: '#Records',
      y2Label: this.state.vdemVariable,
      fetching,
    });
  }

  renderProgress() {
    const { loaded, fetching } = this.state;
    return (
      <div style={{ height: 20 }}>
        { loaded && !fetching ? null : <LinearProgress /> }
      </div>
    )
  }

  render() {
    return <div className="App">
        <AppBar position="static" color="primary">
          <Toolbar>
            <BioDemLogo />
            <Typography variant="title" color="inherit">
              Bio-Dem&nbsp;&mdash;&nbsp;Biodiversity knowledge and political regimes
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="main">
          <div className="controls">
            <FormControl className="formControl" style={{ minWidth: 150, margin: 20 }}>
              <InputLabel htmlFor="country">Country</InputLabel>
              <AutoSelect
                input={<Input name="country" id="country" />}
                value={this.state.country}
                onChange={this.handleCountryChange}
                options={this.state.countries.map(d => ({ value: d, label: d }))}
              />
            </FormControl>
            <FormControl className="formControl" style={{ minWidth: 200, margin: 20 }}>
              <InputLabel htmlFor="vdemVariable">
                Political variable
              </InputLabel>
              <AutoSelect
                input={<Input name="vdemVariable" id="vdemVariable" />}
                value={this.state.vdemVariable}
                onChange={this.handleChange}
                options={vdemOptions}
              />
            </FormControl>
          </div>
          {this.renderProgress()}
          <h1>{byAlpha3[this.state.country].name}</h1>
          <div id="chart" />
          <div id="chart2" />
        </div>
      </div>;
  }
}

export default App;
